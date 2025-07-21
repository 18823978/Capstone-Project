/**
 * Uses "dotenv 16.0.3", MIT License
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

module.exports = {
  app: {
    name: 'EECMS Coordinator System',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    cookieExpires: 24
  },
  
  bcrypt: {
    saltRounds: 12
  },
  
  roles: {
    COORDINATOR: 1,
    ADMIN: 2
  },
  
  email: {
    from: 'noreply@curtin.edu.au',
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }
};