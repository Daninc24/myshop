// Load environment variables first, before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const Product = require('./models/Product');
const Message = require('./models/Message');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, orderLimiter, productLimiter, adminLimiter } = require('./middleware/rateLimiter');
const logger = require('./middleware/logger');
const requestId = require('./middleware/requestId');
const securityHeaders = require('./middleware/security');
const { uploadMultiple } = require('./middleware/upload');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const paymentCredentialRoutes = require('./routes/paymentCredential');
const eventRoutes = require('./routes/events');
const posRoutes = require('./routes/pos');
const customerRoutes = require('./routes/customers');
const couponRoutes = require('./routes/coupons');
const advertsRoutes = require('./routes/adverts');
const testimonialsRoutes = require('./routes/testimonials');
const pageViewRoutes = require('./routes/pageViews');



const { credentialCache, loadCredentials } = require('./utils/credentialCache');

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173/',
      'http://localhost:5174',
      'https://myshoppingcenters-8knn.vercel.app',
      'https://myshoppingcenters.vercel.app',
      'https://myshoppingcenter.vercel.app',
      'https://myshopcenter-git-main-daniel-mailus-projects.vercel.app',
      'https://myshop-git-main-daniel-mailus-projects.vercel.app',
      'https://*.vercel.app',
      'https://myshop-hhfv.vercel.app',
      'https://myshop-hhfv-git-main-daniel-mailus-projects.vercel.app',
      'https://myshop-git-main-daniel-mailus-projects.vercel.app'
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173/',
        'http://localhost:5174',
        'https://myshoppingcenters-8knn.vercel.app',
        'https://myshoppingcenters.vercel.app',
        'https://myshoppingcenter.vercel.app',
        'https://myshopcenter-git-main-daniel-mailus-projects.vercel.app',
        'https://myshop-git-main-daniel-mailus-projects.vercel.app',
        'https://*.vercel.app',
        'https://myshop-hhfv.vercel.app',
        'https://myshop-hhfv-git-main-daniel-mailus-projects.vercel.app',
      'https://myshop-git-main-daniel-mailus-projects.vercel.app',
      'https://*.vercel.app',
        'https://myshop-git-main-daniel-mailus-projects.vercel.app'
      ];
      
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or ends with .vercel.app
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

const onlineUsers = new Set();

// === SOCKET.IO ===
// Implement connection pooling with a Map to store user connections
const userSocketMap = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Use lean() for better performance
    const user = await User.findById(decoded.userId).select('-password').lean();
    if (!user) return next(new Error('Invalid user'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  
  // Store socket in the user socket map for connection pooling
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);
  
  socket.join(userId);
  onlineUsers.add(userId);
  
  // Throttle online users broadcast to reduce unnecessary emissions
  const broadcastOnlineUsers = throttle(() => {
    io.emit('online_users', Array.from(onlineUsers));
  }, 1000);
  
  broadcastOnlineUsers();

  // Implement debounce for typing events to reduce socket traffic
  const typingDebounceMap = new Map();

  socket.on('send_message', async ({ receiver, content }) => {
    if (!receiver || !content) return;
    try {
      const message = await Message.create({ sender: userId, receiver, content });
      io.to(receiver).emit('new_message', message);
      io.to(userId).emit('new_message', message);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ to }) => {
    if (!to) return;
    
    // Implement debouncing for typing events
    const debounceKey = `${userId}-${to}`;
    if (!typingDebounceMap.has(debounceKey)) {
      io.to(to).emit('typing', { from: userId, to });
      
      typingDebounceMap.set(debounceKey, setTimeout(() => {
        typingDebounceMap.delete(debounceKey);
      }, 2000)); // 2 second debounce
    } else {
      // Reset the timeout
      clearTimeout(typingDebounceMap.get(debounceKey));
      typingDebounceMap.set(debounceKey, setTimeout(() => {
        typingDebounceMap.delete(debounceKey);
      }, 2000));
    }
  });

  socket.on('stop_typing', ({ to }) => {
    if (!to) return;
    
    // Clear any existing debounce timeout
    const debounceKey = `${userId}-${to}`;
    if (typingDebounceMap.has(debounceKey)) {
      clearTimeout(typingDebounceMap.get(debounceKey));
      typingDebounceMap.delete(debounceKey);
    }
    
    io.to(to).emit('stop_typing', { from: userId, to });
  });

  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(onlineUsers));
  });

  socket.on('disconnect', () => {
    // Remove socket from user socket map
    if (userSocketMap.has(userId)) {
      const userSockets = userSocketMap.get(userId);
      userSockets.delete(socket.id);
      
      // Only remove user from online users if they have no active connections
      if (userSockets.size === 0) {
        userSocketMap.delete(userId);
        onlineUsers.delete(userId);
        broadcastOnlineUsers();
      }
    } else {
      onlineUsers.delete(userId);
      broadcastOnlineUsers();
    }
  });
});

// Utility function for throttling
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
}

app.use(securityHeaders);
app.use(requestId);
app.use(logger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173/',
  'http://localhost:5174',
  'https://myshoppingcenters-8knn.vercel.app',
  'https://myshoppingcenters.vercel.app',
  'https://myshoppingcenter.vercel.app',
  'https://myshopcenter-git-main-daniel-mailus-projects.vercel.app',
  'https://myshop-git-main-daniel-mailus-projects.vercel.app',
  'https://myshop-hhfv.vercel.app',
  'https://myshop-hhfv-git-main-daniel-mailus-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment-credentials', paymentCredentialRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/adverts', advertsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/pageviews', pageViewRoutes);



// Handle OPTIONS requests for image uploads
app.options('/uploads/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.status(200).end();
});

// Add CORS headers for /uploads before static middleware
app.use('/uploads', cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://myshop-hhfv.onrender.com',
      'https://myshop-hhfv.vercel.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET',
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}), express.static(path.join(__dirname, '../uploads')));

// Fallback removed to prevent conflicts

app.get('/', (req, res) => {
  res.send('MyShopping Center API is running...');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.id,
  });
});





// Alternative image serving route without CORS restrictions
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  
  const fs = require('fs');
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    // Set CORS headers to allow all origins
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Content-Type', contentType);
    res.header('Cache-Control', 'public, max-age=31536000');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    

  } else {
    console.error('API image not found:', filePath);
    res.status(404).json({ error: 'Image not found', filename });
  }
});

// Handle OPTIONS for API images
app.options('/api/images/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.status(200).end();
});



app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestId: req.id,
  });
});

app.use(errorHandler);
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));

app.use(passport.initialize());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// === START SERVER ===
(async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';

    await mongoose.connect(MONGO_URI);

    console.log('✅ MongoDB connected');

    await loadCredentials(); // Load Stripe, PayPal, Mpesa, Google credentials

    // Only initialize Google OAuth if credentials are available
    if (credentialCache.google && credentialCache.google.clientId && credentialCache.google.clientSecret) {
      try {
        passport.use(new GoogleStrategy({
          clientID: credentialCache.google.clientId,
          clientSecret: credentialCache.google.clientSecret,
          callbackURL: '/api/auth/google/callback',
        }, async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: Math.random().toString(36).slice(-8)
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }));
        console.log('✅ Google OAuth strategy initialized');
      } catch (error) {
        console.log('⚠️  Failed to initialize Google OAuth strategy:', error.message);
      }
    } else {
      console.log('⚠️  Google OAuth credentials not configured - Google sign-in disabled');
    }

    server.listen(PORT, () => console.log(`🚀 Server (with Socket.IO) running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});


