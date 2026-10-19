Branding renamed to **দিশারী (Dishari)** on 2026-10-01. The baseline checks below were performed before the rename; the renamed production build and four frontend tests passed.

# Release verification

Verified in the build environment on 2026-09-30:

- Production frontend compilation passed.
- Frontend domain test file passed (Bangla command routing, currency ambiguity, label extraction, phone validation).
- Nine backend tests passed on Python 3.12 with the pinned FastAPI/Starlette dependencies.
- Backend dependency compatibility check passed.
- Chromium headless browser ran actual English and Bengali Tesseract WASM OCR against synthetic images.
- Two-page PDF text extraction passed.
- Settings dialog and emergency dialog keyboard dismissal passed; no automatic dial action occurred.
- 390-pixel mobile viewport had no horizontal overflow.
- Offline reload and English OCR passed after deleting the OCR IndexedDB database, forcing cached worker/core/model assets to be used.
- No uncaught browser JavaScript errors were observed in the smoke run.

These are implementation checks, not a representative accuracy benchmark or a user study. Real device camera/microphone permissions, Bengali device TTS, browser-provider speech recognition, real YOLO/Ollama inference, Docker execution and blind-user usability were not verified in this environment. The model integrations have API/unit contract checks and explicit setup instructions; no model weights are included. The framework test client emits a non-failing deprecation warning about its future HTTP client.

The prebuilt `frontend/dist` folder corresponds to the supplied source. Rebuild after editing. Source reconstruction requires `npm ci`, `npm run setup:offline`, and `npm run build`.
