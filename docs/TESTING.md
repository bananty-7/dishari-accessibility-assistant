# Test guide

## Automated checks

From `frontend`, run `npm test` and `npm run build`. From the activated backend environment, run `python -m pytest -q`. Tests cover ambiguous currency readings, Bangla intent routing, phone validation, invalid/oversized images, API key enforcement, missing models, API result contracts and refusal to infer a clear path from no detections.

## Optional browser smoke tests

Use the production preview (`npm run preview`) and keep it running. In a separate terminal, from the project root:

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/browser-smoke.cjs
```

This optional installation creates a root `node_modules`; it is excluded by `.gitignore`. The smoke script writes synthetic sample images and screenshots. It tests local English/Bangla OCR with actual WASM models, PDF text extraction if the supplied PDF exists, dialogs, narrow-screen overflow, and offline reload plus OCR. Run against a different URL by setting `APP_URL`. It supports `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for an existing browser test installation.

## Manual device checklist

- Grant/deny/revoke camera and microphone permission; test recovery and upload fallback.
- Confirm rear-camera orientation and small-label focus on an actual Android device.
- Verify Bangla speech with installed local voices; verify missing-voice messages.
- Try denied/offline/network-failed voice recognition and unsupported browsers.
- Navigate all controls with Tab, Shift+Tab, Enter and Escape; inspect focus after reading/dialog close.
- Use TalkBack/another screen reader to select modes, start OCR and hear result announcements.
- Test high contrast, large text, 200% browser zoom, and reduced motion.
- Turn off internet only after offline caching finishes; reload and upload a new image/PDF.
- Run scene/object modes with no backend, no weights, wrong key, one busy inference and a working model.
- Verify emergency setup accepts phone digits and opens a dial action only after pressing the confirmation button. Do not place real emergency-service test calls.

Device speech, camera hardware, full vision-language inference and target-user usability are not proven by browser/unit tests. Record their results separately.
