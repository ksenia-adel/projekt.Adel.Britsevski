const User = require('./user');
const Admin = require('./admin');
const Doctor = require('./doctor');
const Patient = require('./patient');
const ServiceCatalog = require('./servicecatalog');
const DoctorService = require('./doctorservice');
const Schedule = require('./schedule');
const Booking = require('./booking');
const Statistic = require('./statistic');

// booking → schedule (with alias)
Booking.belongsTo(Schedule, { foreignKey: 'scheduleid', as: 'scheduleSlot' }); // a booking belongs to one schedule slot
Schedule.hasMany(Booking, { foreignKey: 'scheduleid', as: 'scheduleBookings' }); // a schedule can have many bookings

// booking → patient
Booking.belongsTo(Patient, { foreignKey: 'patientid' }); // each booking is made by a patient
Patient.hasMany(Booking, { foreignKey: 'patientid' });   // one patient can have multiple bookings

// booking → service
Booking.belongsTo(ServiceCatalog, { foreignKey: 'servicecatalogid' }); // each booking is linked to a service
ServiceCatalog.hasMany(Booking, { foreignKey: 'servicecatalogid' });   // one service can be booked many times

// schedule → doctor
Schedule.belongsTo(Doctor, { foreignKey: 'doctorid' }); // each schedule is linked to a doctor
Doctor.hasMany(Schedule, { foreignKey: 'doctorid' });   // one doctor can have many schedule slots

// export all models
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
