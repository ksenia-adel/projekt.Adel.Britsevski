const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');
const Admin = require('./admin');

const Doctor = sequelize.define('doctor', {
  doctorid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  specialty: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
}, {
  tableName: 'doctor',
  schema: 'onlinedoc',
  timestamps: false
});

Doctor.belongsTo(User, { foreignKey: 'userid' });
Doctor.belongsTo(Admin, { foreignKey: 'adminid' });

module.exports = Doctor;
