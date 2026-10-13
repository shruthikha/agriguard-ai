@echo off
title AgriGuard AI Launcher
echo ====================================================
echo             🌾 AgriGuard AI Launcher
echo ====================================================
echo.

echo 1. Launching ML Service (FastAPI / PyTorch on port 8000)...
start "AgriGuard ML Engine" cmd /k "cd /d "%~dp0ml" && python main.py"

echo 2. Launching Backend API (Express on port 5000)...
start "AgriGuard Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo 3. Launching Frontend Client (Vite on port 5173)...
start "AgriGuard Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ====================================================
echo  Services started in 3 dedicated terminal windows!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5000/api
echo   ML Engine: http://localhost:8000/docs
echo ====================================================
pause
