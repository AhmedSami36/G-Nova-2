const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
  
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }
  
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.ID = decoded._id; 
        next();
    } catch (error) {
        console.error('Token validation error:', error.message);
        return res.status(401).json({ message: 'Invalid Token' });
    }
  };
  

module.exports = authMiddleware;
