const jwt = require('jsonwebtoken');
require('dotenv').config();

// middleware to authenticate user using JWT token
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // check if token exists in header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // verify token and decode user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user data in request for future use
    next();
  } catch (e) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
