# Sonken Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Sonken - Development Server Setup   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js v18 or higher." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Frontend dependencies
Set-Location ../frontend
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

# Return to root
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Installation Complete! ✓            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start Sonken, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or start services separately:" -ForegroundColor Yellow
Write-Host "  Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access the dashboard at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API server will run at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
