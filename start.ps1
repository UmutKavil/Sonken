# Sonken Normal Başlatma (Port 8080)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Sonken Başlatılıyor (Port 8080)  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Port 8080'de çalıştır
$env:VITE_PORT = "8080"

Write-Host "✓ Port 8080 kullanılıyor (Yönetici yetkisi gerekmez)" -ForegroundColor Green
Write-Host ""

npm run dev

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   Sonken Başlatıldı!                " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tarayıcınızda açın:" -ForegroundColor Yellow
Write-Host "  http://localhost:8080" -ForegroundColor White
Write-Host ""
