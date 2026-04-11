#!/bin/bash

# Start Python LLM Service and Node.js Backend

echo "========================================="
echo "AI Career Guidance Platform - Full Stack"
echo "========================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null
    exit 0
}

# Register cleanup function
trap cleanup INT TERM

# Start Python LLM Service
echo "🚀 Starting Python LLM Service on port 8000..."
cd "$(dirname "$0")/python-llm"

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [ -f "venv/Scripts/activate" ]; then
    # Windows (Git Bash)
    source venv/Scripts/activate
elif [ -f "venv/bin/activate" ]; then
    # Linux/Mac
    source venv/bin/activate
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt -q

# Start Python LLM Service in background
python llm_career_service.py &
PYTHON_PID=$!
echo "✅ Python LLM Service started (PID: $PYTHON_PID)"

cd ..

# Wait for Python service to start
echo "⏳ Waiting for Python LLM Service to initialize..."
sleep 3

# Start Node.js Backend
echo ""
echo "🚀 Starting Node.js Backend on port 5000..."
cd backend

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start Node.js backend
npm run dev &
NODE_PID=$!
echo "✅ Node.js Backend started (PID: $NODE_PID)"

cd ..

echo ""
echo "========================================="
echo "✅ All services started successfully!"
echo "========================================="
echo ""
echo "📍 Python LLM Service: http://localhost:8000"
echo "📍 Node.js Backend:    http://localhost:5000"
echo "📍 Frontend:           http://localhost:5173"
echo ""
echo "📚 API Documentation:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="
echo ""

# Wait for processes
wait
