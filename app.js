const express = require('express');
require('dotenv').config();
const sequelize = require('./db');
const { User, Admin, Doctor } = require('./models');

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/doctorservices', require('./routes/doctorServiceRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));





const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.sync({ alter: true }); // только для dev
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.error('Server error', e);
  }
}

start();
