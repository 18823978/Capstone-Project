/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
/**
 * Uses "jsonwebtoken 9.0.0", MIT License
 * https://github.com/auth0/node-jsonwebtoken
 */
/**
 * Uses "multer 1.4.5-lts.1", MIT License
 * https://github.com/expressjs/multer
 */
/**
 * Uses "express-validator 7.0.1", MIT License
 * https://express-validator.github.io/
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for debugging
    console.error('ERROR', err);
    
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const messages = err.errors.map(e => e.message);
      error.message = messages.join(', ');
      return res.status(400).json({
        status: 'error',
        message: error.message,
        errors: messages
      });
    }
    
    // JWT token expired error
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    // JWT token invalid error
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    // Sequelize database error
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        status: 'error',
        message: 'Database error. Please try again later or contact support.'
      });
    }
    
    // Sequelize connection error
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection error. Please try again later.'
      });
    }
    
    // Handle multer (file upload) errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum file size is 2MB.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected file upload. Please check file field name.'
      });
    }
    
    // Handle express-validator errors
    if (err.array && typeof err.array === 'function') {
      const validationErrors = err.array();
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Default error response
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  };
  
  module.exports = errorHandler;