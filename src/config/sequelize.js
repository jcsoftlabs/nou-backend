const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000 // 60 secondes
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
