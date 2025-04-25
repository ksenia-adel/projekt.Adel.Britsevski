const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');

const Admin = sequelize.define('admin', {
  adminid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
}, {
  tableName: 'admin',
  schema: 'onlinedoc',
  timestamps: false
});

Admin.belongsTo(User, { foreignKey: 'userid' });

module.exports = Admin;
