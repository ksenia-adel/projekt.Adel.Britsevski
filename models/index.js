const User = require('./user');
const Admin = require('./admin');
const Doctor = require('./doctor');
const Patient = require('./patient');
const ServiceCatalog = require('./servicecatalog');
const DoctorService = require('./doctorservice');
const Schedule = require('./schedule');
const Booking = require('./booking');
const Statistic = require('./statistic');


// 🔗 Associations

// Booking ↔ Schedule (🛠️ УНИКАЛЬНЫЕ alias!)
Booking.belongsTo(Schedule, { foreignKey: 'scheduleid', as: 'scheduleSlot' });
Schedule.hasMany(Booking, { foreignKey: 'scheduleid', as: 'scheduleBookings' });

// Booking ↔ Patient
Booking.belongsTo(Patient, { foreignKey: 'patientid' });
Patient.hasMany(Booking, { foreignKey: 'patientid' });

// Booking ↔ ServiceCatalog
Booking.belongsTo(ServiceCatalog, { foreignKey: 'servicecatalogid' });
ServiceCatalog.hasMany(Booking, { foreignKey: 'servicecatalogid' });

// Schedule ↔ Doctor (добавить эту строку)
Schedule.belongsTo(Doctor, { foreignKey: 'doctorid' });
Doctor.hasMany(Schedule, { foreignKey: 'doctorid' });


module.exports = {
  User,
  Admin,
  Doctor,
  Patient,
  ServiceCatalog,
  DoctorService,
  Schedule,
  Booking,
  Statistic
};
