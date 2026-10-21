@echo off
setlocal
cd /d "%~dp0..\frontend\dist"
if not exist index.html (
 echo Prebuilt files missing. Use start-windows.cmd to build from source.
 pause
 exit /b 1
)
echo Open http://localhost:4173 in Chrome or Edge.
start "" "http://localhost:4173"
py -3 -m http.server 4173 --bind 127.0.0.1
pause
