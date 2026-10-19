# Dishari — online Gemini scene description

API key backend-এর `.env.gemini` file-এ থাকবে। Browser, frontend source, GitHub বা chat-এ key রাখবেন না। বর্তমান `.gitignore` এই file বাদ দেয়। Google Gemini-তে শুধুমাত্র scene mode-এর user-selected ছবিটি যায়। OCR/PDF/medicine/currency স্থানীয়ভাবে চলে; obstacle mode আগের YOLO ব্যবহার করে।

## আগে থেকেই Dishari চালানো থাকলে

1. Frontend ও backend-এর CMD window-তে Ctrl+C দিন।
2. `Dishari_Gemini_Update.zip` extract করুন। ZIP-এর ভেতর থেকে script চালাবেন না।
3. Extract করা `Dishari_Gemini_Update` folder-এর `apply-update-windows.cmd` double-click করুন।
4. Default project path: `E:\Dishari_Windows_Project\dishari`। এটিই আপনার path হলে Enter দিন। অন্য হলে সঠিক **dishari root folder**-এর path লিখুন।
5. Script backend-এর দুটো Python file, frontend-এর built app ও সংশ্লিষ্ট source update করবে। আগের Python files-এর `.before-gemini` backup থাকবে। `.venv`, `.env`, downloaded YOLO weights ও personal files মুছবে না।
6. Script Notepad-এ backend-এর `.env.gemini` খুলবে। `PASTE_YOUR_KEY_HERE` মুছে নিজের key বসিয়ে save করুন। `.txt` extension যোগ করবেন না।

উদাহরণ (এটি আসল key নয়):

```dotenv
SCENE_PROVIDER=gemini
GEMINI_API_KEY=YOUR_ACTUAL_KEY
GEMINI_MODEL=gemini-2.5-flash-lite
YOLO_MODEL_PATH=models/yolo11n.pt
```

## Backend start

সবচেয়ে সহজ উপায়: project-এর `scripts\start-gemini-backend-windows.cmd` double-click করুন। অথবা নিচের manual command ব্যবহার করুন।

Backend folder-এ CMD খুলুন:

```bat
.venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file .env.gemini
```

ইতোমধ্যে requirements install থাকলে নতুন package লাগে না—`httpx` দিয়েই official REST API call হয়। `--env-file .env.gemini` অংশটি বাদ দিলে Gemini config load হবে না।

## Frontend start এবং পরীক্ষা

আগের `scripts\preview-prebuilt-windows.cmd` চালান। Chrome-এ `http://localhost:4173` খুলুন এবং Ctrl+F5 দিন। পুরোনো app দেখালে tab বন্ধ করে আবার খুলুন, যাতে নতুন service worker control নেয়।

Settings → Test connection-এ `Scene model: configured (not verified)` দেখাবে। এর অর্থ key-এর config আছে; provider-এ সফল request হয়েছে এমন নয়। Backend health endpoint `/api/health`-এ `scene_provider: gemini` থাকবে।

“চারপাশ দেখুন” mode-এ চেয়ার/টেবিলের একটি সাধারণ ছবি দিন। ফলাফলে **Gemini online** source ও বাংলা বর্ণনা থাকবে। এটি আপনার account-এর বাস্তব প্রথম API test। Sensitive document/মানুষের ব্যক্তিগত ছবি দিয়ে initial test করবেন না।

Gemini key-কে app Settings-এর **API key** ঘরে দেবেন না। ওই ঘরটি Dishari backend-এর optional authentication token-এর জন্য।

## Error হলে

| Message | করণীয় |
|---|---|
| `GEMINI_API_KEY নেই` | `.env.gemini`-তে key ও startup command-এর env flag দেখুন। |
| Request অনুমোদিত হয়নি | key সঠিক কি, project permissions ও Gemini API access আছে কি পরীক্ষা করুন। |
| quota/rate limit | AI Studio-তে প্রকৃত quota দেখুন। Free allowance guaranteed নয়; billing চালু করা বাধ্যতামূলক বলা হচ্ছে না। |
| model পাওয়া যায়নি | account-এ model available কি দেখুন; official docs অনুযায়ী `.env.gemini`-তে model নাম বদলান। |
| connection পাওয়া যায়নি | internet/firewall পরীক্ষা করুন। |
| ব্যবহারযোগ্য বর্ণনা নেই | provider blocked/empty response দিয়েছে; অন্য সাধারণ পরিষ্কার ছবি দিন। |

App automatic retry করে না। প্রতিবার নতুন করে scene request করলে account quota/usage খরচ হতে পারে। এক request-এর output 512 token পর্যন্ত সীমিত এবং image সর্বোচ্চ 1024-pixel edge-এ resize হয়। Rate limits, model availability ও pricing provider নির্ধারণ করে।

## Offline mode-এ ফিরে যাওয়া

`.env.gemini`-তে `SCENE_PROVIDER=local` দিন এবং backend restart করুন। Scene mode আবার YOLO object summary দেবে (অথবা configured local Ollama model ব্যবহার করবে)। Key মুছেও রাখতে পারেন। Google-এ কোনো scene request যাবে না।

## Verification

Provider request format, Bengali text parsing, image resizing, header-only key, missing key, quota/permission/model/server errors, blocked response এবং local fallback automated mock tests দিয়ে পরীক্ষা করা হয়েছে। User-এর real key দিয়ে live call করা হয়নি; actual quota ও Bengali description quality প্রথম ছবির test-এ যাচাই করতে হবে।

Official references:
- https://ai.google.dev/gemini-api/docs/image-understanding
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/api-key
