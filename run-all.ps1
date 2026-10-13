# AgriGuard AI PowerShell Launcher
Write-Host "====================================================" -ForegroundColor Green
Write-Host "            🌾 AgriGuard AI Launcher                " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

$baseDir = $PSScriptRoot

Write-Host "1. Launching ML Service (FastAPI / PyTorch on port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$baseDir\ml`"; python main.py"

Write-Host "2. Launching Backend API (Express on port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$baseDir\server`"; npm run dev"

Write-Host "3. Launching Frontend Client (Vite on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$baseDir\client`"; npm run dev"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Services started in 3 dedicated terminal windows!  " -ForegroundColor Cyan
Write-Host "   Frontend : http://localhost:5173                 " -ForegroundColor White
Write-Host "   Backend  : http://localhost:5000/api             " -ForegroundColor White
Write-Host "   ML Engine: http://localhost:8000/docs            " -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
