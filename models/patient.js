const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');

const Patient = sequelize.define('patient', {
  patientid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  personalcode: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING
}, {
  tableName: 'patient',
  schema: 'onlinedoc',
  timestamps: false
});

Patient.belongsTo(User, { foreignKey: 'userid' });

module.exports = Patient;
