const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Statistic = sequelize.define('statistic', {
  statisticid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporttype: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  generateddate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  adminid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportcontent: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'statistic',
  schema: 'onlinedoc',
  timestamps: false
});

module.exports = Statistic;
