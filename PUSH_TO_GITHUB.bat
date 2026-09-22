@echo off
title DroidForge Studio - Push to GitHub (Adnan10p)
color 0B

echo ========================================================
echo     Uploading DroidForge Studio to GitHub (@Adnan10p)
echo ========================================================
echo.

echo [INFO] Step 1: Checking Git status...
git status

echo.
echo [INFO] Step 2: Pushing to repository: https://github.com/Adnan10p/droidforge-studio.git
echo.
echo Note: If GitHub asks for login credentials in a popup or browser window, 
echo please log in with your GitHub account (Adnan10p).
echo.

git push -u origin main

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ========================================================
    echo [SUCCESS] Project successfully uploaded to GitHub!
    echo URL: https://github.com/Adnan10p/droidforge-studio
    echo ========================================================
) else (
    color 0C
    echo.
    echo [NOTE] If repository does not exist yet on GitHub:
    echo 1. Go to https://github.com/new
    echo 2. Create repository named: droidforge-studio
    echo 3. Run this PUSH_TO_GITHUB.bat script again!
)

echo.
pause
