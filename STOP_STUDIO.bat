@echo off
cd /d "%~dp0"
title DroidForge Studio - Stop Server
color 0C

echo ========================================================
echo         Stopping DroidForge Studio Server
echo ========================================================
echo.

:: Find and kill process listening on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [INFO] Stopping DroidForge Server process PID %%a
    taskkill /F /PID %%a >nul 2>nul
)

echo [OK] DroidForge Studio Server stopped.
echo.
pause
