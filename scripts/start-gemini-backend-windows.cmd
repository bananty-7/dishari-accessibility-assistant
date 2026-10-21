@echo off
setlocal
cd /d "%~dp0..\backend"
if not exist ".venv\Scripts\python.exe" (
 echo Your backend virtual environment is missing. Follow the original backend setup first.
 pause
 exit /b 1
)
if not exist ".env.gemini" (
 echo Create .env.gemini from .env.gemini.example and insert your API key.
 pause
 exit /b 1
)
findstr /c:"PASTE_YOUR_KEY_HERE" ".env.gemini" >nul
if not errorlevel 1 (
 echo Replace PASTE_YOUR_KEY_HERE in .env.gemini with your own key and save.
 start "" notepad.exe ".env.gemini"
 pause
 exit /b 1
)
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file .env.gemini
pause
