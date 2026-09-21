@echo off
echo ===================================================
echo Starting TALENTIQ AI Platform (Backend + Frontend)
echo ===================================================

start "TALENTIQ Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "TALENTIQ Frontend" cmd /k "cd frontend && npm run dev"

echo TALENTIQ AI is launching!
echo Backend:  http://127.0.0.1:8000 (Swagger docs at /docs)
echo Frontend: http://localhost:5173
echo ===================================================
