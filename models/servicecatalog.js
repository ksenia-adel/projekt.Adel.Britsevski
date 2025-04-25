const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Admin = require('./admin');

const ServiceCatalog = sequelize.define('servicecatalog', {
  servicecatalogid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  duration: { type: DataTypes.INTEGER }, // в минутах
  price: { type: DataTypes.FLOAT },
}, {
  tableName: 'servicecatalog',
  schema: 'onlinedoc',
  timestamps: false
});

ServiceCatalog.belongsTo(Admin, { foreignKey: 'adminid' });

module.exports = ServiceCatalog;
