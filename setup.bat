@echo off
echo ========================================
echo  AI Career Guidance Platform Setup
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [2/5] Checking MongoDB...
net start | find "MongoDB" >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB service is not running
    echo Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo Could not start MongoDB automatically
        echo Please start MongoDB manually
        pause
    )
) else (
    echo ✓ MongoDB is running
)
echo.

echo [3/5] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Backend dependencies already installed
)
echo.

echo [4/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file
    echo PLEASE EDIT: backend\.env with your MongoDB URI and JWT secret
    pause
) else (
    echo ✓ .env file exists
)
echo.

cd ..
echo [5/5] Installing frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Frontend dependencies already installed
)
echo.

cd ..
echo ========================================
echo  Setup Complete! ✓
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Edit backend\.env with your configuration
echo 2. Open TWO terminals:
echo.
echo    Terminal 1 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser: http://localhost:5173
echo.
echo For detailed instructions, see:
echo - QUICKSTART.md
echo - SETUP_GUIDE.md
echo.
pause
