@echo off
title FinGuard AI Platform Launcher
echo =====================================================================
echo               FinGuard AI - Starting Services
echo =====================================================================
echo.
echo [1/2] Starting Backend API Server (FastAPI on http://127.0.0.1:8000)...
start "FinGuard AI Backend" cmd /k "cd backend && ..\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Frontend Client (Vite on http://localhost:5173)...
start "FinGuard AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo Both servers have been launched in separate terminal windows!
echo - Web Dashboard:  http://localhost:5173
echo - API & Docs:     http://127.0.0.1:8000/docs
echo =====================================================================
pause
