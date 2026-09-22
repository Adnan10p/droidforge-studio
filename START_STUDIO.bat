@echo off
title DroidForge Studio - Quick Starter
color 0A

echo ========================================================
echo         DroidForge Studio - Visual App Builder
echo ========================================================
echo.

:: 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing Node.js, restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node -v
echo.

:: 2. Check node_modules directory
if not exist node_modules (
    echo [INFO] Installing project dependencies (first time setup)...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
    echo.
)

:: 3. Show Local IP for Phone Testing
echo --------------------------------------------------------
echo Starting Localhost Server on http://localhost:3000 ...
echo.
echo To test on your mobile phone:
echo  1. Connect your phone to the SAME Wi-Fi network as this PC.
echo  2. Open browser on your phone and go to: http://YOUR_PC_IP:3000
echo --------------------------------------------------------
echo.

:: 4. Launch DroidForge Studio Server
call npm run dev

pause
