@echo off
title PashuRakshak AI - Unified Server (Backend + Frontend + UI)
echo ========================================================
echo   Starting PashuRakshak AI Unified Localhost Server...
echo   Dashboard UI       : http://localhost:8000
echo   Backend AI API     : http://localhost:8000/predict
echo   Interactive Docs   : http://localhost:8000/docs
echo ========================================================
cd /d "%~dp0"

if exist "backend\venv\Scripts\python.exe" (
    "backend\venv\Scripts\python.exe" app.py %*
) else (
    python app.py %*
)
pause
