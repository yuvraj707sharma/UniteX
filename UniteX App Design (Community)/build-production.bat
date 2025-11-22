@echo off
REM =====================================================
REM UniteX Production Build Script (Windows)
REM =====================================================
REM This script builds an optimized production APK
REM Usage: build-production.bat
REM =====================================================

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           UniteX Production Build                         ║
echo ║           Optimized for Performance                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Step 1: Clean previous builds
echo [INFO] Step 1/6: Cleaning previous builds...
call npm run clean 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
echo [SUCCESS] Clean complete
echo.

REM Step 2: Check dependencies
echo [INFO] Step 2/6: Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm ci
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
) else (
    echo [INFO] Dependencies already installed
)
echo [SUCCESS] Dependencies ready
echo.

REM Step 3: Build web app
echo [INFO] Step 3/6: Building optimized React app...
call npm run build:prod
if errorlevel 1 (
    echo [ERROR] React build failed
    exit /b 1
)
echo [SUCCESS] React build complete
echo.

REM Step 4: Sync with Capacitor
echo [INFO] Step 4/6: Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo [ERROR] Capacitor sync failed
    exit /b 1
)
echo [SUCCESS] Capacitor sync complete
echo.

REM Step 5: Build Android APK
echo [INFO] Step 5/6: Building Android release APK...
cd android
call gradlew clean
call gradlew assembleRelease --no-daemon --parallel --build-cache
if errorlevel 1 (
    echo [ERROR] Android build failed
    cd ..
    exit /b 1
)
cd ..
echo [SUCCESS] Android build complete
echo.

REM Step 6: Report results
echo [INFO] Step 6/6: Checking build output...
set APK_PATH=android\app\build\outputs\apk\release\app-release-unsigned.apk

if exist "%APK_PATH%" (
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                  BUILD SUCCESSFUL                         ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo [SUCCESS] APK Location: %APK_PATH%
    for %%A in ("%APK_PATH%") do echo [SUCCESS] APK Size: %%~zA bytes
    echo.
    echo Next steps:
    echo   1. Sign the APK (see documentation)
    echo   2. Test on physical device
    echo   3. Upload to Play Store or distribute
    echo.
) else (
    echo [ERROR] APK not found at expected location
    exit /b 1
)

echo [SUCCESS] Build process completed successfully!
echo.
pause
