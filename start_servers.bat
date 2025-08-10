@echo off
echo Starting PRTL Application Servers...

echo Starting Backend Server...
cd backend
start "Backend Server" php artisan serve --host=127.0.0.1 --port=8000
cd ..

echo Starting Frontend Server...
cd frontend
start "Frontend Server" npm start
cd ..

echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul 