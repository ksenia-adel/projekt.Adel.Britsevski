const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Booking = sequelize.define('booking', {
  bookingid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  servicecatalogid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  scheduleid: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'booking',
  schema: 'onlinedoc',
  timestamps: false
});

module.exports = Booking;
