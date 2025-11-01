# Sonken - Quick Reference Card

## 🚀 Quick Start (3 Commands)

```powershell
# 1. Run setup script
.\setup.ps1

# 2. Start Sonken
npm run dev

# 3. Open browser
# http://localhost:5173
```

## 📌 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:5173 | Main UI |
| API Server | http://localhost:3001/api | Backend API |
| Health Check | http://localhost:3001/api/health | Server status |
| WebSocket | ws://localhost:3002 | Real-time updates |

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `backend/src/index.js` | Server entry point |
| `frontend/src/App.jsx` | Frontend entry point |
| `backend/src/api/routes/` | API endpoints |
| `frontend/src/pages/` | UI pages |

## ⚡ Common Commands

```powershell
# Development
npm run dev              # Start both backend & frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Production
npm run build            # Build for production
npm start                # Start production server

# Individual services
cd backend && npm run dev    # Backend with nodemon
cd frontend && npm run dev   # Frontend with Vite
```

## 🎨 API Quick Reference

### Projects
```
GET    /api/projects           # List all
POST   /api/projects           # Create new
GET    /api/projects/:id       # Get one
PUT    /api/projects/:id       # Update
DELETE /api/projects/:id       # Delete
POST   /api/projects/:id/toggle # Start/Stop
```

### Monitoring
```
GET /api/monitoring/resources/:projectId
GET /api/monitoring/requests/:projectId
GET /api/monitoring/errors/:projectId
GET /api/monitoring/throughput/:projectId
```

### Database
```
GET /api/database/metrics/:projectId
GET /api/database/slow-queries/:projectId
```

### System
```
GET /api/system/info
GET /api/system/resources
GET /api/system/network
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | Change `PORT` in backend/.env |
| Port 5173 in use | Change in frontend/vite.config.js |
| WebSocket won't connect | Check `WS_PORT` in backend/.env |
| Frontend blank | Check backend is running |
| No real-time updates | Check WebSocket connection status |

## 📊 Default Configuration

```env
PORT=3001                      # API server port
WS_PORT=3002                   # WebSocket port
MONITOR_INTERVAL=2000          # Metrics every 2 seconds
SLOW_QUERY_THRESHOLD=1000      # Queries > 1 second
CORS_ORIGIN=http://localhost:5173
```

## 🎯 Project Structure (Simplified)

```
Sonken/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── api/routes/  # Endpoints
│   │   ├── services/    # Monitoring
│   │   └── database/    # SQLite
│   └── .env             # Config
│
└── frontend/            # React UI
    └── src/
        ├── pages/       # Dashboard, ProjectDetail, SystemInfo
        ├── components/  # Layout, Card
        └── services/    # API, WebSocket
```

## 💡 Feature Highlights

✅ **Real-Time Monitoring** - WebSocket updates every 2 seconds
✅ **Per-Project Metrics** - CPU, Memory, Disk per project
✅ **Database Analysis** - Size, connections, slow queries
✅ **System Overview** - Complete system resource tracking
✅ **Modern UI** - React + TailwindCSS + Chart.js
✅ **RESTful API** - Clean, documented endpoints

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `PROJECT_OVERVIEW.md` - Technical implementation details
- `CONTRIBUTING.md` - Contribution guidelines
- `QUICK_REFERENCE.md` - This file!

## 🔐 Database Tables

1. **projects** - Project configurations
2. **resource_metrics** - CPU/Memory/Disk data
3. **database_metrics** - DB performance
4. **slow_queries** - Query logs
5. **http_requests** - Request logs
6. **error_logs** - Error tracking

## 🎨 Tech Stack At-a-Glance

**Backend**: Node.js + Express + SQLite + WebSocket
**Frontend**: React + Vite + TailwindCSS + Chart.js
**Monitoring**: systeminformation + mysql2

## 🚦 Development Workflow

1. Create project in dashboard
2. Start project monitoring
3. View real-time metrics
4. Analyze database performance
5. Check slow queries
6. Review error logs

## 🎉 That's It!

You're now ready to use Sonken. For more details:
- See SETUP.md for installation
- See PROJECT_OVERVIEW.md for architecture
- See README.md for features

**Happy coding! 🚀**
