const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,  // название БД
  process.env.DB_USER,      // пользователь
  process.env.DB_PASSWORD,  // пароль
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    schema: process.env.DB_SCHEMA || 'onlinedoc', // если используешь SCHEMA
    logging: false, // отключает лишние логи
  }
);

module.exports = sequelize;
