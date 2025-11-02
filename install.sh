#!/bin/bash

echo "===================================="
echo "  Sonken Installation Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""

echo "npm version:"
npm --version
echo ""

echo "Installing root dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi

echo ""
echo "Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    cd ..
    exit 1
fi

cd ..

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    cd ..
    exit 1
fi

cd ..

echo ""
echo "===================================="
echo "  Installation Complete!"
echo "===================================="
echo ""
echo "To start Sonken, run: ./start.sh"
echo "Or use: npm run dev"
echo ""
