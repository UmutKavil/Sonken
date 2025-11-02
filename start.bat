@echo off
echo ====================================
echo   Starting Sonken Development Server
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

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting Sonken...
echo Backend API: http://localhost:3001
echo Frontend Dashboard: http://localhost:5173
echo WebSocket: ws://localhost:3002
echo.
echo Press Ctrl+C to stop the servers
echo.

:: Start the development server
call npm run dev
