@echo off
setlocal
cd /d "%~dp0..\backend"
if not exist .venv (
 py -3 -m venv .venv
 if errorlevel 1 goto fail
)
call .venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 goto fail
if exist .env (
 python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file .env
) else (
 python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
)
exit /b
:fail
echo Install Python 3.11 or 3.12 and check the error above.
pause
exit /b 1
