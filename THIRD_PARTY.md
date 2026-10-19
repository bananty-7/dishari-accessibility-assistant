# Third-party components

Original Dishari source: AGPL-3.0-or-later. Keep upstream license notices when redistributing dependencies/models.

| Component | Upstream | Typical upstream license |
|---|---|---|
| React | https://github.com/facebook/react | MIT |
| Vite | https://github.com/vitejs/vite | MIT |
| Lucide icons | https://github.com/lucide-icons/lucide | ISC |
| Tesseract.js / core | https://github.com/naptha/tesseract.js | Apache-2.0 |
| Bengali / English traineddata | https://github.com/tesseract-ocr/tessdata | Apache-2.0 |
| PDF.js | https://github.com/mozilla/pdf.js | Apache-2.0 |
| FastAPI / Starlette | https://github.com/fastapi/fastapi / https://github.com/Kludex/starlette | MIT / BSD-3-Clause |
| Ultralytics (optional) | https://github.com/ultralytics/ultralytics | AGPL-3.0 or commercial terms |
| Ollama (optional runtime) | https://github.com/ollama/ollama | MIT; model licenses are separate |
| Inter / Noto Sans Bengali | https://github.com/rsms/inter / https://github.com/notofonts/bengali | SIL Open Font License 1.1 |

The distribution includes offline OCR assets and font binaries so the prebuilt app can run without downloading them. Their license files are in `licenses/`. The source build reconstructs the offline assets from pinned npm dependencies.

No YOLO model weights or language-model weights are bundled in the ZIP. Users explicitly download their chosen models; check their terms before redistributing or hosting them. The Llama model mentioned in the setup guide has its own license and use terms, separate from Ollama's runtime license.
