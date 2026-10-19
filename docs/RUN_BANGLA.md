# Windows-এ দিশারী চালানোর সম্পূর্ণ নিয়ম

## ১. ZIP extract করুন

ZIP-এ right click → **Extract All**। সহজ path ব্যবহার করুন, যেমন `E:\Dishari\dishari`। এই folder-এর মধ্যে `frontend`, `backend`, `scripts`, `README.md` থাকবে। ZIP-এর ভেতর থেকে সরাসরি script চালাবেন না।

## ২. সবচেয়ে সহজ preview

Python 3.11/3.12 install থাকলে `scripts\preview-prebuilt-windows.cmd` double-click করুন। Browser-এ **http://localhost:4173** খুলুন। এই পথে bundled built app চলে; source বদলালে নিচের Node.js পদ্ধতিতে rebuild করতে হবে।

## ৩. Development setup

Node.js 22.12 বা নতুন version install করুন। তারপর নতুন CMD খুলুন:

```bat
node -v
npm -v
```

`scripts\start-windows.cmd` double-click করলেও install/build/start হয়ে যাবে। অথবা CMD-তে:

```bat
cd /d E:\Dishari\dishari\frontend
npm ci
npm run setup:offline
npm run build
npm run preview
```

**http://localhost:4173** খুলুন। CMD বন্ধ করলে server বন্ধ হবে। VS Code ব্যবহার করতে চাইলে `dishari` folder-এ CMD খুলে `code .` লিখুন।

`package.json` আছে এমন `frontend` folder-এ npm command দেবেন। Folder ভুল হলে `ENOENT` হবে।

## ৪. প্রথম OCR test

1. App-এর **লেখা পড়ুন** button বেছে নিন।
2. **ছবি দিন** থেকে `samples\english-note.png` অথবা `samples\bangla-note.png` দিন।
3. Result panel-এ লেখা আসবে। OCR model প্রথমবার load হতে কিছু সময় লাগে।
4. Camera ব্যবহার করলে browser permission দিন, ভালো আলোতে বইয়ের পাতা ধরুন, **ছবি নিয়ে পড়ুন** চাপুন।
5. **আবার শুনুন** দিয়ে audio শুনুন। বাংলা voice না থাকলে message দেখাবে; text result থাকবে।

Settings থেকে reading speed, বড় লেখা, high contrast ও auto-read পরিবর্তন করা যাবে।

## ৫. বাংলা voice

Device/browser-এ Bangla TTS voice থাকতে হবে। Android Settings → Accessibility বা General management → Text-to-speech → voice engine → Bangla voice download করুন। Manufacturer অনুযায়ী menu বদলায়।

App default-এ local Bangla voice চায়। বাংলা voice install করা না থাকলে অন্য ভাষার voice দিয়ে বাংলা পড়া হবে না।

Voice command-এর জন্য **mic** button চাপুন। বলুন:

- “লেখা পড়ো” — OCR mode
- “টাকা পড়ো” — currency text mode
- “ওষুধের লেবেল পড়ো” — medicine label mode
- “ডকুমেন্ট পড়ো” — document mode
- “চারপাশ দেখাও” — scene mode
- “সামনে কী আছে” — object alert mode
- “ছবি তোলো” — camera capture (camera চালু থাকতে হবে)
- “আবার পড়ো” — repeat result
- “থামো” — stop reading
- “জরুরি সাহায্য” — contact dialog

বাংলা offline speech pack সব browser-এ নেই। Settings-এ **Browser voice service অনুমতি দিন** চালু করলে audio browser-এর provider-এ যেতে পারে এবং internet লাগতে পারে। এটি default-এ বন্ধ।

## ৬. Offline test

Production preview খুলে **Offline app ready** দেখুন। তারপর internet disconnect করুন, app reload করুন এবং নতুন sample image দিন। OCR ও PDF reader চলার কথা। Browser storage clear করলে cache মুছে যাবে; আবার online load করতে হবে।

`npm run dev` দিয়ে offline cache হয় না। `npm run build` → `npm run preview` ব্যবহার করুন। Emergency কলের জন্য mobile network/dialer লাগবে। Local AI backend-এর connection থাকাও প্রয়োজন।

## ৭. Backend চালু করুন

Python 3.11/3.12 install করুন। প্রথম terminal-এ frontend চলতে দিন। দ্বিতীয় CMD:

```bat
cd /d E:\Dishari\dishari\backend
py -3 -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

App Settings-এ backend `http://localhost:8000` দিন → **Test connection**। শুধু API connected মানে AI model installed নয়। Model status দেখুন।

## ৮. Real object detection

Backend terminal-এ Ctrl+C দিয়ে থামান। Activated environment-এ:

```bat
python -m pip install -r requirements-ai.txt
python download_model.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

PyTorch ও model download-এ বেশি disk/RAM/internet লাগতে পারে। Normal OCR-এর জন্য এই setup লাগে না। **সামনের বস্তু** mode একটি ছবি থেকে মানুষ/চেয়ার/গাড়ির মতো পরিচিত বস্তু শনাক্ত করে। এটি চলার সময় live obstacle monitoring করে না, distance বলে না, “পথ নিরাপদ” বলে না।

## ৯. Full scene AI (optional)

Ollama install করে CMD-তে:

```bat
ollama pull llama3.2-vision
```

এই model যথেষ্ট RAM চায়। `backend\.env.example` copy করে `.env` করুন। File-এ:

```dotenv
OLLAMA_VISION_MODEL=llama3.2-vision
OLLAMA_URL=http://localhost:11434
```

Backend restart করুন:

```bat
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file .env
```

AI model download না করলে scene mode-এ YOLO object summary চলবে, অথবা model missing message আসবে। কোনো fake result দেওয়া হবে না।

## ১০. Android-এ পরীক্ষা

PWA-এর জন্য secure HTTPS URL অথবা localhost দরকার। PC-এর `http://192.168...` address-এ camera/mic বন্ধ থাকতে পারে। USB দিয়ে পরীক্ষার জন্য Android platform-tools, developer options এবং USB debugging enable করুন। নিজের device-এ authorize করে:

```bat
adb devices
adb reverse tcp:4173 tcp:4173
adb reverse tcp:8000 tcp:8000
```

PC-তে frontend/backend চালু রাখুন। Phone Chrome-এ **http://localhost:4173** খুলুন। Settings-এর backend **http://localhost:8000**। Chrome menu → Install app / Add to Home Screen দিয়ে install করুন। এটি APK নয়; Play Store upload-ready package নয়।

## ১১. GitHub-এ upload

Git install করুন। GitHub-এ নতুন repository **dishari-accessibility-assistant** তৈরি করুন। README/license/gitignore auto-add করবেন না; project-এ এগুলো আছে।

Root folder-এর CMD:

```bat
cd /d E:\Dishari\dishari
git init
git status
git add .
git commit -m "Build Dishari Bangla accessibility research prototype"
git branch -M main
git remote add origin https://github.com/bananty-7/dishari-accessibility-assistant.git
git push -u origin main
```

Browser sign-in এলে নিজের account দিয়ে authenticate করুন। `.env`, `node_modules`, `.venv`, `dist`, model binary GitHub-এ যাবে না। Package lock যাবে। README-এর setup command দিয়ে অন্য কেউ assets আবার তৈরি করতে পারবে।

আগে `origin` থাকলে প্রথমে `git remote -v` দেখুন। অন্য repository-র ওপর blind push করবেন না।

## সাধারণ সমস্যা

| সমস্যা | করণীয় |
|---|---|
| `ENOENT package.json` | `frontend` folder-এ যান। |
| OCR model loading failed | `npm ci` → `npm run setup:offline` → rebuild; `public/vendor/lang` আছে কি দেখুন। |
| Camera permission denied | Chrome/Edge-এ localhost খুলুন; site permissions reset করে আবার দিন। |
| বাংলা audio নেই | Local Bangla TTS voice install করুন; সব Windows browser voice expose করে না। |
| API unavailable | দ্বিতীয় CMD-তে backend চালু আছে কি দেখুন; Settings URL মিলিয়ে নিন। |
| Object model নেই | AI requirements ও `download_model.py` চালিয়ে backend restart করুন। |
| Ollama unavailable | Ollama চলছে কি, model downloaded কি এবং `.env` loaded কি দেখুন। |
| PC slow/hang | Ollama বন্ধ রেখে OCR ব্যবহার করুন; কম resolution ছবি দিন; অন্য heavy app বন্ধ করুন। |
| Port busy | ওই port-এর পুরোনো server বন্ধ করুন; port বদলালে URL ও backend CORS মিলিয়ে দিন। |

Currency result একটি tentative OCR reading; medicine result শুধু label text। Scholarship application-এ implemented feature ও measured result আলাদা করে লিখবেন।
