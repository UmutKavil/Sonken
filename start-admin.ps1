# Sonken Başlatma Scripti (Yönetici Olarak Çalıştırın!)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Sonken Başlatılıyor...            " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Admin kontrolü
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  UYARI: Bu script yönetici yetkisiyle çalıştırılmalı!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Çözüm:" -ForegroundColor Cyan
    Write-Host "1. PowerShell'i SAĞ TIKLAYIP 'Yönetici olarak çalıştır' seçin" -ForegroundColor White
    Write-Host "2. Bu scripti tekrar çalıştırın" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternatif: Port 80 yerine 8080 kullanmak için:" -ForegroundColor Cyan
    Write-Host "  frontend/vite.config.js dosyasında port: 80 → port: 8080" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

Write-Host "✓ Yönetici yetkileri doğrulandı" -ForegroundColor Green
Write-Host ""

# Port 80'i kontrol et ve temizle
Write-Host "Port 80 kontrol ediliyor..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($process) {
    Write-Host "⚠️  Port 80 kullanımda, temizleniyor..." -ForegroundColor Yellow
    Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "✓ Port 80 hazır" -ForegroundColor Green
Write-Host ""

# Sonken'i başlat
Write-Host "Sonken başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

npm run dev

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   Sonken Başlatıldı!                " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tarayıcınızda açın:" -ForegroundColor Yellow
Write-Host "  http://localhost" -ForegroundColor White
Write-Host ""
