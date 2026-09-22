@echo off
cd /d "%~dp0"
title DroidForge Studio - Visual App Builder
color 0A

echo ========================================================
echo         DroidForge Studio - Visual App Builder
echo ========================================================
echo.

:: 1. Check package.json
if exist package.json goto CHECKNODE
color 0C
echo [ERROR] package.json not found!
echo Please make sure you extracted all files from the ZIP archive before running.
echo Current directory: %CD%
echo.
pause
exit /b 1

:CHECKNODE
:: 2. Check Node.js
call node -v >nul 2>nul
if errorlevel 1 goto NONODE

echo [OK] Node.js version:
call node -v
echo.

:: 3. Check node_modules
if exist node_modules goto RUNSERVER

echo [INFO] Installing project dependencies (first time setup)...
call npm install
if errorlevel 1 goto NPMFAILED
echo [OK] Dependencies installed successfully!
echo.

:RUNSERVER
echo --------------------------------------------------------
echo Starting DroidForge Studio Server on http://localhost:3000
echo.
echo To test on mobile phone (Same Wi-Fi):
echo Open browser on phone: http://YOUR_PC_IP:3000
echo --------------------------------------------------------
echo.

call npm run dev
if errorlevel 1 goto SERVERERROR
goto END

:NONODE
color 0C
echo [ERROR] Node.js is NOT installed or not in system PATH!
echo.
echo Please follow these steps:
echo  1. Download Node.js (LTS version) from: https://nodejs.org/
echo  2. Complete the installation.
echo  3. Restart your PC or command prompt, then run this script again.
echo.
pause
exit /b 1

:NPMFAILED
color 0C
echo [ERROR] npm install failed. Please check your internet connection.
echo.
pause
exit /b 1

:SERVERERROR
color 0C
echo.
echo [ERROR] DroidForge Studio server stopped with an error.
echo.
pause
exit /b 1

:END
pause
