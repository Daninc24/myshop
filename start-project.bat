@echo off
echo 🚀 Starting MyShop E-commerce Platform...
echo.

echo 📋 Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm
    pause
    exit /b 1
)

echo ✅ npm is available

echo.
echo 📦 Installing dependencies...

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo ✅ Dependencies installed successfully

echo.
echo 🌱 Setting up database...

:: Seed the database
cd backend
call npm run seed
if %errorlevel% neq 0 (
    echo ⚠️ Database seeding failed - you may need to configure MongoDB
    echo Check the QUICK-START-GUIDE.md for database setup instructions
)

echo.
echo 🎉 Setup complete! Starting servers...
echo.
echo 📝 Opening important files...
start notepad PROJECT-DOCUMENTATION.md

echo.
echo 🚀 Starting backend server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🚀 Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📋 Access your application:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5002
echo - Health Check: http://localhost:5002/health
echo.
echo 👤 Sample accounts:
echo - Admin: admin@myshop.com / admin123
echo - User: john@example.com / user123
echo.
echo 📖 Check QUICK-START-GUIDE.md for troubleshooting
echo.
pause