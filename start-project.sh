#!/bin/bash

echo "🚀 Starting MyShop E-commerce Platform..."
echo

echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed ($(node --version))"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ npm is available ($(npm --version))"

echo
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo "✅ Dependencies installed successfully"

echo
echo "🌱 Setting up database..."

# Seed the database
cd backend
npm run seed
if [ $? -ne 0 ]; then
    echo "⚠️ Database seeding failed - you may need to configure MongoDB"
    echo "Check the QUICK-START-GUIDE.md for database setup instructions"
fi

echo
echo "🎉 Setup complete! Starting servers..."
echo

# Function to start servers in background
start_servers() {
    echo "🚀 Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    
    sleep 3
    
    echo "🚀 Starting frontend server..."
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    echo
    echo "✅ Both servers are running!"
    echo
    echo "📋 Access your application:"
    echo "- Frontend: http://localhost:5173"
    echo "- Backend API: http://localhost:5002"
    echo "- Health Check: http://localhost:5002/health"
    echo
    echo "👤 Sample accounts:"
    echo "- Admin: admin@myshop.com / admin123"
    echo "- User: john@example.com / user123"
    echo
    echo "📖 Check QUICK-START-GUIDE.md for troubleshooting"
    echo
    echo "Press Ctrl+C to stop both servers"
    
    # Wait for user to stop
    trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
    wait
}

start_servers