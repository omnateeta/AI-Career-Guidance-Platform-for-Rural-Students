@echo off
REM Start Python LLM Service and Node.js Backend

echo =========================================
echo AI Career Guidance Platform - Full Stack
echo =========================================
echo.

REM Start Python LLM Service
echo Starting Python LLM Service on port 8000...
cd python-llm

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt -q

REM Start Python LLM Service in background
start "Python LLM Service" cmd /k "python llm_career_service.py"
echo Python LLM Service started in new window

cd ..

REM Wait for Python service to start
echo Waiting for Python LLM Service to initialize...
timeout /t 3 /nobreak >nul

REM Start Node.js Backend
echo.
echo Starting Node.js Backend on port 5000...
cd backend

REM Install Node dependencies if needed
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
)

REM Start Node.js backend
start "Node.js Backend" cmd /k "npm run dev"
echo Node.js Backend started in new window

cd ..

echo.
echo =========================================
echo All services started successfully!
echo =========================================
echo.
echo Python LLM Service: http://localhost:8000
echo Node.js Backend:    http://localhost:5000
echo Frontend:           http://localhost:5173
echo.
echo API Documentation:  http://localhost:8000/docs
echo.
echo Check the opened terminal windows for service logs
echo Close those windows to stop the services
echo =========================================
echo.
pause
