# Evaluation plan — collect evidence, not ratings

No user-study results or benchmark accuracy are bundled. Scholarship/job value depends on evidence of what you built, tested, learned and improved; this project does not guarantee admission or a job.

## OCR evaluation

Create a consented or synthetic held-out image set. Record source, Bangla/English/mixed script, font size, lighting, blur, skew, document type and whether it is handwriting. Keep training/tuning and evaluation images separate. Do not publish personal prescriptions, names, phone numbers or identifiable scenes without appropriate consent.

Transcribe a reference, save the app's prediction, and record elapsed time. Compare raw text and a documented normalized variant. The supplied evaluator normalizes Unicode to NFC and whitespace; it does not remove punctuation or automatically correct words.

Create JSONL with one record per image:

```json
{"id":"sample-001","reference":"আজ একটি সুন্দর দিন।","prediction":"আজ একটি সুন্দর দিন।","latency_ms":1200,"success":true}
```

Run:

```bash
python scripts/evaluate_ocr.py my_predictions.jsonl
```

Report aggregate character error rate (CER), word error rate (WER), per-condition counts and errors, median/P95 elapsed time, failed cases, and device specifications. `success` is a manually defined task outcome, not derived from OCR confidence. Synthetic fixtures prove a path runs; they do not demonstrate real-world accuracy.

## Currency and medicine

Currency OCR can confuse serial numbers, prices and several denominations in the same image. Measure correct readings, incorrect confident readings and abstentions separately. Collect both sides of notes, varying wear and lighting. Do not present this version as an authenticity checker.

For medicine labels, assess text-reading errors on strength, dates and names. Ask a qualified reviewer to assess consequential errors. Do not test ingestion or dosage decisions. Label examples should be synthetic or de-identified.

## Object/scene evaluation

Record detection misses, false positives, positional errors, descriptive hallucinations and inference latency. Include objects outside the pretrained model's classes. An empty detection is a failure to recognize known objects, not proof of clear space. Do not use participants to test unvalidated navigation in traffic or other uncontrolled environments.

## Accessibility/user study

Work with consenting blind/low-vision users and, when appropriate, an accessibility organization or institutional ethics review. Provide accessible consent and withdrawal. Avoid collecting sensitive image/audio data unnecessarily. Start with seated reading tasks in controlled surroundings.

Define tasks before testing: read a paragraph, locate a label field, repeat speech, stop speech, use emergency contact confirmation without actually dispatching a call, and recover from a missing model or poor image. Compare against the participant's existing workflow, allow practice, and report participant count and limitations.

Measure task completion, time, assistance requests, errors, perceived workload and qualitative feedback. Test TalkBack, keyboard navigation, voice fallback, offline use, slow devices, glare, and large text. Do not invent participant counts, endorsements or percentages.

## Repository evidence

Include a short demo video, architecture explanation, issue tracker, test commands, anonymized failure examples, dataset provenance, evaluation script/output and clear feature limitations. Add results only after collecting them. A useful research question is: **How much does Bangla-first offline reading reduce task time and dependence on another person under different lighting conditions?**
