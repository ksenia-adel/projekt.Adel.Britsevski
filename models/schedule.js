const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Schedule = sequelize.define('schedule', {
  scheduleid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  starttime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endtime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  doctorid: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'schedule',
  schema: 'onlinedoc',
  timestamps: false
});

module.exports = Schedule;
