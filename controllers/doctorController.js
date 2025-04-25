const { Doctor, Booking, Schedule, Patient, User, ServiceCatalog} = require('../models');
const bcrypt = require('bcrypt');

// generates a random password for the doctor
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

// creates a doctor and associated user
exports.createDoctor = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, specialty } = req.body;
    const adminId = req.user.userid; // admin who creates this doctor
    const rawPassword = generatePassword(); // plain password
    const hashedPassword = await bcrypt.hash(rawPassword, 10); // hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'doctor'
    });
    const doctor = await Doctor.create({
      firstname,
      lastname,
      email,
      phone,
      specialty,
      userid: user.userid,
      adminid: adminId
    });
    // return credentials (not recommended for production)
    res.status(201).json({
      message: 'Doctor created successfully',
      doctor,
      login: {
        email,
        password: rawPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Doctor creation failed', error: err.message });
  }
};

// returns all doctors (open to all roles)
exports.getAllDoctors = async (req, res) => {
  const doctors = await Doctor.findAll();
  res.json(doctors);
};

// updates doctor info and user email
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, specialty } = req.body;
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await doctor.update({ firstname, lastname, email, phone, specialty });
    const user = await User.findByPk(doctor.userid);
    if (user) {
      await user.update({ email }); // optionally update more fields
    }
    res.json({ message: 'Doctor updated', doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// deletes doctor and associated user
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await Doctor.destroy({ where: { doctorid: id } });
    await User.destroy({ where: { userid: doctor.userid } });
    res.json({ message: 'Doctor and associated user deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};


// gets all bookings for the logged-in doctor
exports.getDoctorBookings = async (req, res) => {
  try {
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const bookings = await Booking.findAll({
      include: [
        {
          model: Schedule,
          as: 'scheduleSlot',
          where: { doctorid: doctor.doctorid }
        },
        {
          model: Patient,
          include: [{ model: User }]
        },
        {
          model: ServiceCatalog
        }
      ],
      order: [['bookingid', 'DESC']]
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bookings', error: err.message });
  }
};
