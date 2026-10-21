@echo off
setlocal
cd /d "%~dp0..\frontend"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 22.12 or newer, then open this file again.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 goto fail
)
call npm run setup:offline
if errorlevel 1 goto fail
call npm run build
if errorlevel 1 goto fail
echo Open http://localhost:4173 in Chrome or Edge.
start "" "http://localhost:4173"
call npm run preview
exit /b
:fail
echo Setup failed. See the error above and docs\RUN_BANGLA.md.
pause
exit /b 1
