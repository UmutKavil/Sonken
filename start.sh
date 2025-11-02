#!/bin/bash

echo "===================================="
echo "  Starting Sonken Development Server"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "Starting Sonken..."
echo "Backend API: http://localhost:3001"
echo "Frontend Dashboard: http://localhost:5173"
echo "WebSocket: ws://localhost:3002"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start the development server
npm run dev
