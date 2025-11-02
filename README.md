# Sonken

**Next-Generation Local Development Server + APM Dashboard**

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()
[![Node](https://img.shields.io/badge/Node.js-v18%2B-green)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

## 🚀 Vision

Sonken is a modern, all-in-one local development server and Application Performance Monitoring (APM) dashboard designed specifically for developers who want more than just a server stack.

Unlike traditional solutions (XAMPP, MAMP), Sonken provides **integrated, real-time performance analytics for every project** running in your local environment.

### 🌍 Cross-Platform Support
- ✅ **Windows 10/11**
- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Linux** (Ubuntu, Debian, Fedora, etc.)

## ✨ Key Features

### Per-Project Analytics Dashboard
- **Real-time Resource Monitoring**
  - CPU usage per project
  - Memory (RAM) consumption tracking
  - Disk usage analysis
  
- **Database Performance Analysis**
  - Database size monitoring
  - Slow query detection and logging
  - Connection pool analysis
  
- **Network & Request Monitoring**
  - HTTP error tracking (404, 500, etc.)
  - Request throughput visualization
  - Response time metrics

### Multi-Project Management
- Manage multiple local projects simultaneously
- Easy project creation and configuration
- Per-project environment variables
- Custom domain mapping (e.g., project-a.test)

## 🏗️ Architecture

```
Sonken/
├── backend/           # Node.js + Express API Server
│   ├── api/          # REST API endpoints
│   ├── services/     # Core monitoring services
│   └── database/     # Configuration database
├── frontend/         # React + Vite Dashboard UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── services/         # System monitoring modules
│   ├── resource-monitor/
│   ├── database-analyzer/
│   └── request-tracker/
└── server-stack/     # Server configurations
    ├── nginx/
    ├── php/
    └── mysql/
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React, Vite, TailwindCSS, Chart.js
- **Monitoring**: node-os-utils, systeminformation, mysql2
- **Server Stack**: Nginx, PHP-FPM, MySQL/MariaDB

## 📦 Installation

### Quick Start

**Windows:**
```batch
# Clone the repository
git clone https://github.com/UmutKavil/Sonken.git
cd Sonken

# Run installer
install.bat

# Start Sonken
start.bat
```

**macOS / Linux:**
```bash
# Clone the repository
git clone https://github.com/UmutKavil/Sonken.git
cd Sonken

# Make scripts executable
chmod +x install.sh start.sh

# Run installer
./install.sh

# Start Sonken
./start.sh
```

**Using npm (All Platforms):**
```bash
npm run setup
npm run dev
```

For detailed installation instructions and troubleshooting, see [CROSS_PLATFORM_GUIDE.md](./CROSS_PLATFORM_GUIDE.md)

## 🚦 Getting Started

1. Start the Sonken control panel
2. Create your first project
3. Configure your project settings (PHP version, database, etc.)
4. Start monitoring your application's performance in real-time

## 🎯 Target Audience

- **Web Developers** managing multiple projects
- **Full-Stack Developers** optimizing application performance
- **Backend Developers** analyzing database efficiency
- Anyone frustrated with XAMPP's limitations

## 🔥 Why Sonken Over XAMPP?

| Feature | XAMPP | Sonken |
|---------|-------|--------|
| Server Stack | ✅ | ✅ |
| Per-Project Monitoring | ❌ | ✅ |
| Resource Analytics | ❌ | ✅ |
| Database Query Analysis | ❌ | ✅ |
| Modern UI | ❌ | ✅ |
| Request Tracking | ❌ | ✅ |
| Error Log Analysis | Basic | Advanced |

## 📝 Roadmap

- [x] Project initialization
- [ ] Core monitoring services
- [ ] REST API development
- [ ] Dashboard UI
- [ ] Database integration
- [ ] Multi-project support
- [ ] Server stack integration
- [ ] Real-time WebSocket updates
- [ ] Performance recommendations
- [ ] Export reports

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built with ❤️ for developers who demand more from their local environment.
