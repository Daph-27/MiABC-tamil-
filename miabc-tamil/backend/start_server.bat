@echo off
echo Starting MiABC Tamil Backend Server...
echo Server will be accessible at http://localhost:8000
echo.
cd /d %~dp0
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
