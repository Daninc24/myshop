# 🚀 **Quick Start Guide - Get Your Project Running**

## **⚡ Immediate Steps to Fix Your Project**

### **Step 1: Database Setup (CRITICAL)**

You have 3 options for the database:

#### **Option A: Use Local MongoDB (Fastest)**
```bash
# Install MongoDB locally (if not installed)
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
# Windows: Start MongoDB service from Services
# Mac/Linux: sudo systemctl start mongod
```

#### **Option B: Use MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Replace in `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/myshop
```

#### **Option C: Use Demo Database (Quick Test)**
Your `.env` is already configured with a demo database that should work immediately.

### **Step 2: Start the Backend Server**
```bash
cd backend
npm install
npm run dev
```

### **Step 3: Start the Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Step 4: Test the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5002
- Health Check: http://localhost:5002/health

## **🔧 If You Still Have Issues**

### **Common Problems & Solutions:**

#### **Problem: "Cannot connect to MongoDB"**
**Solution:**
```bash
# Check if MongoDB is running
# Windows: Check Services for MongoDB
# Mac/Linux: sudo systemctl status mongod

# Or use the demo connection string in .env:
MONGO_URI=mongodb://localhost:27017/myshoppingcenter
```

#### **Problem: "Port 5002 already in use"**
**Solution:**
```bash
# Kill process on port 5002
# Windows:
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5002 | xargs kill -9
```

#### **Problem: "Module not found"**
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## **🎯 Performance Optimizations Applied**

1. **Lazy Loading**: Components load only when needed
2. **Database Indexes**: Optimized database queries
3. **Caching**: Browser and server-side caching
4. **Compression**: Gzip compression enabled
5. **Error Handling**: Silent handling of expected errors

## **✅ Success Indicators**

When everything is working correctly, you should see:

1. **Backend Console:**
```
✅ MongoDB connected
✅ Database indexes created successfully
🚀 Server (with Socket.IO) running on port 5002
```

2. **Frontend Console:**
```
No errors in browser console
Fast page loading (< 3 seconds)
Smooth navigation between pages
```

3. **Browser:**
```
Homepage loads with products
Search functionality works
Cart operations work
User registration/login works
```

## **🆘 Still Need Help?**

If you're still experiencing issues:

1. **Check the logs** in both frontend and backend consoles
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly: http://localhost:5002/api/products
4. **Check network tab** in browser dev tools for failed requests

The most common issue is the MongoDB connection. Make sure you have either:
- Local MongoDB running, OR
- Valid MongoDB Atlas connection string, OR
- Use the demo database provided