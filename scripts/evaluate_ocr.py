"""NFC/whitespace-normalized aggregate CER/WER, optional latency and task success."""
import argparse
import json
import statistics
import unicodedata
from pathlib import Path


def normalized(text):
    return ' '.join(unicodedata.normalize('NFC', text).split())


def distance(left, right):
    previous = list(range(len(right) + 1))
    for i, char in enumerate(left, 1):
        current = [i]
        for j, other in enumerate(right, 1):
            current.append(min(current[-1] + 1, previous[j] + 1, previous[j-1] + (char != other)))
        previous = current
    return previous[-1]


def evaluate(records):
    chars = words = char_errors = word_errors = 0
    latencies = []
    success = []
    for row in records:
        ref = normalized(row['reference'])
        pred = normalized(row['prediction'])
        if not ref:
            raise ValueError('Each reference must contain text.')
        chars += len(ref)
        words += len(ref.split())
        char_errors += distance(ref, pred)
        word_errors += distance(ref.split(), pred.split())
        if isinstance(row.get('latency_ms'), (int, float)) and row['latency_ms'] >= 0:
            latencies.append(row['latency_ms'])
        if isinstance(row.get('success'), bool):
            success.append(row['success'])
    if not records:
        raise ValueError('No evaluation records found.')
    result = {'samples': len(records), 'normalization': 'Unicode NFC and collapsed whitespace',
              'CER': char_errors/chars, 'WER': word_errors/words,
              'reference_characters': chars, 'reference_words': words}
    if latencies:
        ordered = sorted(latencies)
        import math
        result.update(latency_samples=len(latencies), median_latency_ms=statistics.median(ordered),
                      p95_latency_ms=ordered[max(0, math.ceil(.95*len(ordered))-1)])
    if success:
        result.update(task_samples=len(success), task_success_rate=sum(success)/len(success))
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('file', type=Path)
    args = parser.parse_args()
    try:
        rows = [json.loads(line) for line in args.file.read_text(encoding='utf-8').splitlines() if line.strip()]
        print(json.dumps(evaluate(rows), ensure_ascii=False, indent=2))
    except (OSError, KeyError, ValueError, TypeError) as error:
        parser.exit(1, f'Evaluation failed: {error}\n')
