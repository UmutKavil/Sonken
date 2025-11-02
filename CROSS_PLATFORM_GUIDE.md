# Cross-Platform Setup Guide

## Sonken - Windows & macOS/Linux Compatible

Sonken is now fully cross-platform and works seamlessly on:
- ✅ **Windows 10/11**
- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Linux** (Ubuntu, Debian, Fedora, etc.)

---

## 📋 Prerequisites

### All Platforms
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Windows Additional
- **Visual C++ Build Tools** (for some native modules)
  - Install via: `npm install --global windows-build-tools`

### macOS Additional
- **Xcode Command Line Tools**
  - Install via: `xcode-select --install`

---

## 🚀 Quick Start

### Windows

#### Option 1: Using Batch Script (Recommended)
```batch
# Install dependencies
install.bat

# Start Sonken
start.bat
```

#### Option 2: Using npm
```batch
npm run setup
npm run dev
```

### macOS / Linux

#### Option 1: Using Shell Script (Recommended)
```bash
# Make scripts executable (first time only)
chmod +x install.sh start.sh

# Install dependencies
./install.sh

# Start Sonken
./start.sh
```

#### Option 2: Using npm
```bash
npm run setup
npm run dev
```

---

## 📦 Manual Installation

If you prefer to install dependencies manually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start development servers
npm run dev
```

---

## 🎯 Available Commands

### Cross-Platform npm Scripts

```bash
# Start development servers (backend + frontend)
npm run dev

# Install all dependencies
npm run setup

# Clean all node_modules
npm run clean

# Build for production
npm run build

# Start production server
npm start

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

### Platform-Specific Scripts

**Windows:**
```batch
install.bat    # Install all dependencies
start.bat      # Start development servers
```

**macOS/Linux:**
```bash
./install.sh   # Install all dependencies
./start.sh     # Start development servers
```

---

## 🌐 Server URLs

After starting, access Sonken at:

- **Frontend Dashboard:** `http://localhost:5173` (or port shown in terminal)
- **Backend API:** `http://localhost:3001`
- **WebSocket:** `ws://localhost:3002`

---

## 🔧 Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3001
WS_PORT=3002
NODE_ENV=development

# Database
DB_PATH=./database/sonken.db

# Monitoring
MONITOR_INTERVAL=2000
SLOW_QUERY_THRESHOLD=1000

# Frontend URL
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Windows:**
```batch
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

### Node.js Not Found

Make sure Node.js is installed and added to PATH:

```bash
node --version
npm --version
```

If not found, restart your terminal or reinstall Node.js.

### Permission Denied (macOS/Linux)

```bash
# Make scripts executable
chmod +x install.sh start.sh

# If still having issues with npm global packages
sudo chown -R $(whoami) ~/.npm
```

### Module Not Found Errors

```bash
# Clean and reinstall dependencies
npm run clean
npm run setup
```

---

## 📂 Project Structure

```
Sonken/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── api/         # REST API routes
│   │   ├── database/    # SQLite database
│   │   ├── services/    # Monitoring services
│   │   └── utils/       # Cross-platform utilities
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API clients
│   └── package.json
├── install.bat          # Windows installer
├── install.sh           # Unix installer
├── start.bat            # Windows starter
├── start.sh             # Unix starter
└── package.json         # Root package file
```

---

## 🔒 Platform-Specific Features

### Windows
- Uses `robocopy` for efficient file copying
- PowerShell scripts available (.ps1)
- Native Windows path handling

### macOS/Linux
- Uses `cp` for file operations
- Bash scripts for automation
- Unix path conventions
- Better performance with symbolic links

---

## 🎨 Development Tips

### Hot Reload
- Backend: Changes auto-restart via `nodemon`
- Frontend: Changes reflect instantly via Vite HMR

### Debugging

**VSCode Launch Configuration:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.js"
    }
  ]
}
```

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 💡 Pro Tips

1. **Use the appropriate script for your platform** for best performance
2. **Keep Node.js updated** to the latest LTS version
3. **Use environment variables** for sensitive configuration
4. **Run with administrator/sudo** only if absolutely necessary
5. **Check firewall settings** if WebSocket connections fail

---

## 🤝 Contributing

When contributing, ensure your changes work on all platforms:

1. Test on Windows, macOS, and Linux if possible
2. Use the cross-platform utilities in `backend/src/utils/platform.js`
3. Avoid platform-specific commands in source code
4. Use `path.join()` instead of string concatenation for paths
5. Document platform-specific behavior

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Search existing [GitHub Issues](https://github.com/UmutKavil/Sonken/issues)
3. Create a new issue with:
   - Your operating system and version
   - Node.js version (`node --version`)
   - Complete error message
   - Steps to reproduce

---

**Happy Coding! 🚀**
