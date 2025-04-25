const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  userid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('patient', 'admin', 'doctor'),
    defaultValue: 'patient'
  }
}, {
  tableName: 'user',
  schema: 'onlinedoc',
  timestamps: false
});

module.exports = User;
