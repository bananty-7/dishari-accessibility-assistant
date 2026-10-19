# Architecture

## Reading path

The React client accepts a camera still or a user-selected file. Images are oriented, resized to a maximum 2200-pixel edge and converted to JPEG before local OCR. Tesseract.js loads the bundled Bengali (`ben`) and English (`eng`) LSTM data in a Web Worker. OCR returns plain text and a model confidence score. The score is displayed as a score, never as measured accuracy.

PDF.js extracts text from pages with a text layer. Pages with fewer than 20 extracted characters are rendered to canvas and sent through local OCR. This heuristic may miss poor-quality embedded text; evaluation should include such PDFs. PDF input is capped at 10 MB and 20 pages.

Currency logic normalizes Bangla digits, requires currency context, and accepts exactly one distinct supported numeric denomination. It declines ambiguity. It is a text heuristic, not a trained banknote recognition model.

Medicine mode reads text, extracts lines containing strength/batch/expiry keywords, and speaks a verification reminder. It does not match medicines to a database or infer a dosage.

## Local vision path

Scene/object modes send an explicitly captured/selected image to the configured FastAPI endpoint. The request has an optional API key. The backend limits accepted decoded images and reads at most 10 MB of the uploaded file. Multipart framework buffering occurs before endpoint validation; public deployment therefore needs reverse-proxy body-size limits as well.

One inference request at a time is allowed; a concurrent request receives HTTP 429. A detector is loaded only from a model file already present at startup. Missing models return explicit HTTP 503 rather than fabricated objects. YOLO runs on CPU and yields object labels, confidences and normalized boxes. Horizontal positions come from box centers; they do not encode distance.

Scene mode calls local Ollama if a vision model is configured. If not configured, it gives a labeled detected-object summary. If configured but unavailable, it returns a model error rather than silently changing providers.

## Voice and control

Web Speech recognition produces text, then deterministic intent matching selects a mode. Selecting a mode never automatically sends an image. “Capture” acts on the current mode after camera permission. Emergency commands open a confirmation dialog.

Recognition prefers on-device Bengali support. A browser-provider service is available only after explicit settings opt-in. Text-to-speech chooses an installed Bangla voice, preferring local voices by default. Unavailable voice support produces a visible fallback message.

## Offline and persistence

The build script generates a content-hashed service worker cache containing the app, fonts, OCR worker, WASM cores and language files. Old Dishari cache versions are removed on activation. Captured photos and result text are not runtime-cached.

Only settings (including contact and optional API token) are saved in localStorage. Reading text is held in React state and can be downloaded explicitly. The server does not create a reading history. Upload framework temporary files may be created and are closed after the request.

## Extension boundaries

Replace currency heuristics with a validated banknote model only after collecting lawful representative data and documenting class-specific accuracy and abstention. Add a native Android layer if robust device speech or background operation is needed. Live obstacle navigation needs much more than adding a frame loop: latency, unknown objects, depth, dynamic scenes and user safety all need separate validation.
