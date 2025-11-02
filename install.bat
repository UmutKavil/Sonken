@echo off
echo ====================================
echo   Sonken Installation Script
echo ====================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo npm version:
npm --version
echo.

echo Installing root dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Installing backend dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ====================================
echo   Installation Complete!
echo ====================================
echo.
echo To start Sonken, run: start.bat
echo Or use: npm run dev
echo.
pause
