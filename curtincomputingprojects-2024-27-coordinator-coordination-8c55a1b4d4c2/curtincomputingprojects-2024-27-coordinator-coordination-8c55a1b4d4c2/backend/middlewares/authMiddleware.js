/**
 * Uses "jsonwebtoken 9.0.0", MIT License
 * https://github.com/auth0/node-jsonwebtoken
 */
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const config = require('../config/config');

/**
 * Middleware to verify JWT token and authenticate user
 */
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({
      status: 'error',
      message: 'You are not logged in. Please log in to get access.'
    });
  }
  
  try {
    console.log('\n=== Token Verification Debug ===');
    console.log('Request path:', req.path);
    console.log('JWT Secret:', config.jwt.secret);
    console.log('Token:', token);
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Decoded token:', decoded);
    
    // Find user by ID with role
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        status: user.status,
        role_id: user.role_id
      });
    }
    
    // Check if user exists
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      console.log('User is not active, status:', user.status);
      return res.status(401).json({
        status: 'error',
        message: 'This user account is currently on leave.'
      });
    }
    
    // Set user in request object
    req.user = user;
    console.log('Token verification successful, proceeding to next middleware');
    next();
  } catch (error) {
    console.error('\n=== Token Verification Error ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or token expired.',
      details: error.message
    });
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...Number} roleIds - Role IDs allowed to access the route
 */
exports.restrictTo = (...roleIds) => {
  return (req, res, next) => {
    // Check if user role is in the allowed roles
    if (!roleIds.includes(req.user.role_id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Middleware to update last login timestamp
exports.updateLastLogin = async (req, res, next) => {
  try {
    // Update user's last login timestamp
    await User.update(
      { last_login: new Date() },
      { where: { id: req.user.id } }
    );
    next();
  } catch (error) {
    next(error);
  }
};