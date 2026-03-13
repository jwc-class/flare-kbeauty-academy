@echo off
cd /d "%~dp0"
echo Building from: %CD%
call npm run build
pause
