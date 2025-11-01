# Sonken Setup Guide

Welcome to Sonken! Follow these steps to get your development server and APM dashboard up and running.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL/MariaDB (optional, for database monitoring)

## Installation Steps

### 1. Install Dependencies

First, install all dependencies for both backend and frontend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/sonken.db
WS_PORT=3002
MONITOR_INTERVAL=2000
SLOW_QUERY_THRESHOLD=1000
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Development Servers

From the root directory, run:

```bash
npm run dev
```

This will start both:
- Backend API server on `http://localhost:3001`
- Frontend dashboard on `http://localhost:5173`
- WebSocket server on `ws://localhost:3002`

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Usage

### Creating Your First Project

1. Open `http://localhost:5173` in your browser
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Your project name
   - **Domain**: Local domain (e.g., `myproject.test`)
   - **Path**: Full path to your project folder
   - **PHP Version**: Select your PHP version
   - **Database**: (Optional) Database name if applicable

4. Click "Create"

### Starting a Project

1. From the dashboard, click the "Start" button on your project card
2. The project status will change to "running"
3. Monitoring will begin automatically

### Viewing Project Details

1. Click "Details" on any project card
2. View real-time metrics:
   - CPU, Memory, and Disk usage graphs
   - Database size and connection counts
   - Slow queries
   - Error logs

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/toggle` - Start/stop project

### Monitoring
- `GET /api/monitoring/resources/:projectId` - Get resource metrics
- `GET /api/monitoring/requests/:projectId` - Get HTTP requests
- `GET /api/monitoring/errors/:projectId` - Get error logs

### Database
- `GET /api/database/metrics/:projectId` - Get database metrics
- `GET /api/database/slow-queries/:projectId` - Get slow queries

### System
- `GET /api/system/info` - Get system information
- `GET /api/system/resources` - Get current resource usage

## Configuration

### Monitoring Interval

Adjust the monitoring frequency in `backend/.env`:

```env
MONITOR_INTERVAL=2000  # Collect metrics every 2 seconds
```

### Slow Query Threshold

Set the threshold for slow query detection (in milliseconds):

```env
SLOW_QUERY_THRESHOLD=1000  # Queries slower than 1 second
```

## Troubleshooting

### Backend won't start
- Ensure port 3001 is available
- Check Node.js version: `node --version` (should be v18+)
- Check logs for specific errors

### Frontend won't connect
- Verify backend is running on port 3001
- Check CORS settings in `backend/.env`
- Clear browser cache

### WebSocket connection issues
- Ensure port 3002 is available
- Check firewall settings
- Verify WS_PORT in backend `.env`

### Database monitoring not working
- Verify MySQL credentials in project settings
- Ensure MySQL server is running
- Check database user permissions

## Development

### Project Structure

```
Sonken/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── api/         # REST API routes
│   │   ├── database/    # SQLite database
│   │   └── services/    # Monitoring services
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       └── services/    # API & WebSocket clients
└── package.json         # Root package file
```

### Adding New Features

1. Backend routes: Add to `backend/src/api/routes/`
2. Frontend pages: Add to `frontend/src/pages/`
3. Monitoring services: Add to `backend/src/services/`

## Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

## Support

For issues and feature requests, please visit:
https://github.com/UmutKavil/Sonken/issues

## License

MIT License - See LICENSE file for details
