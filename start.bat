@echo off

echo Starting backend...
start /B cmd /c "cd server && venv\Scripts\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8000"

echo Starting Electron...
cd client
npm start