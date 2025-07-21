/**
 * Uses "Sequelize 6.31.1", MIT License
 * https://sequelize.org/
 */
const { Sequelize } = require('sequelize');
/**
 * Uses "dotenv 16.0.3", MIT License
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true, // needed for AWS RDS SSL connection
        rejectUnauthorized: false // needed for AWS RDS SSL connection
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // Adds createdAt and updatedAt to models
      underscored: true // Use snake_case for database column names
    }
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Connected to AWS RDS MySQL with Sequelize'))
  .catch((err) => console.error('Database Connection Error:', err));

  async function getTables() {
    try {
      const [results] = await sequelize.query("SHOW TABLES");
      console.log("Tables in the database:", results);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  }
  
  getTables();
module.exports = { sequelize };//module.exports = sequelize;
