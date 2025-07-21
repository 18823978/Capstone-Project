/**
 * Uses "Express.js 4.18.2", MIT License
 * https://expressjs.com/
 */
const express = require('express');
/**
 * Uses "CORS 2.8.5", MIT License
 * https://github.com/expressjs/cors
 */
const cors = require('cors');
/**
 * Uses "Helmet 7.0.0", MIT License
 * https://helmetjs.github.io/
 */
const helmet = require('helmet');
/**
 * Uses "Morgan 1.10.0", MIT License
 * https://github.com/expressjs/morgan
 */
const morgan = require('morgan');

/**
 * Uses "Express Rate Limit 6.7.0", MIT License
 * https://github.com/nfriedly/express-rate-limit
 */
const rateLimit = require('express-rate-limit');
/**
 * Uses "dotenv 16.0.3", MIT License
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const connectInterfaceRoutes = require('./routes/connectInterfaceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const leaveStatementRoutes = require('./routes/leaveStatementRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

// Import error handler middleware
const errorHandler = require('./middlewares/errorHandler');

// Import logger services
const { requestLogger, errorLogger } = require('./services/loggerService');

// Initialize Express app
const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', apiLimiter);

// API routes
app.use('/api/courses', courseRoutes);
app.use('/api/connect-interfaces', connectInterfaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-statements', leaveStatementRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorLogger);

module.exports = app;