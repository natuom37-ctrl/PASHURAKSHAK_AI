@echo off
title PashuRakshak AI - Full Stack Launcher
echo ========================================================
echo   Launching PashuRakshak AI (Backend API + Frontend)
echo ========================================================
cd /d "%~dp0"

echo [1/2] Starting Backend AI API (FastAPI on Port 8000)...
start "PashuRakshak Backend API" cmd /k "cd backend && ..\backend\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Localhost Server (Port 5500)...
start "PashuRakshak Frontend Server" cmd /k "backend\venv\Scripts\python.exe serve.py"

echo ========================================================
echo   Both services are now launching!
echo   Frontend : http://localhost:5500
echo   Backend  : http://localhost:8000
echo ========================================================
