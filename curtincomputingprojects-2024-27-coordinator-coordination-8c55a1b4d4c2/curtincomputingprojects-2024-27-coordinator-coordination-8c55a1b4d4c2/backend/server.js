const app = require('./app');
const { sequelize } = require('./config/db');
/**
 * Uses "dotenv 16.0.3", MIT License
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test database connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database
    if (process.env.NODE_ENV === 'development') {
      // Use force: false and alter: false to prevent automatic table structure changes
      await sequelize.sync({ force: false, alter: false });
      console.log('Database tables synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await testDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

startServer();