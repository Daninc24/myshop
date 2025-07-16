const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token.' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const orderProcessor = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      const allowedRoles = ['admin', 'staff', 'cashier', 'manager'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Order processing allowed for admin, staff, cashier, or manager only.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Access denied.' });
  }
};

module.exports = { auth, orderProcessor }; 