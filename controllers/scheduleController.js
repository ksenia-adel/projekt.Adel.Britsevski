const { Schedule, Doctor, Booking } = require('../models');

// doctor creates a new available slot
exports.createSlot = async (req, res) => {
  try {
    const { date, starttime, endtime } = req.body;
    const userid = req.user.userid;
    // find doctor by userid from token
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // create new schedule entry
    const schedule = await Schedule.create({
      date,
      starttime,
      endtime,
      doctorid: doctor.doctorid
    });
    res.status(201).json({ message: 'Slot created', schedule });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create slot', error: err.message });
  }
};

// doctor gets their own schedule
exports.getMySchedule = async (req, res) => {
  try {
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // fetch all schedule entries for this doctor
    const schedule = await Schedule.findAll({ where: { doctorid: doctor.doctorid } });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get schedule', error: err.message });
  }
};

// doctor deletes a schedule slot (only their own)
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const slot = await Schedule.findByPk(id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    // ensure doctor owns the slot
    if (slot.doctorid !== doctor.doctorid) {
      return res.status(403).json({ message: 'Access denied: not your slot' });
    }
    await slot.destroy();
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete slot', error: err.message });
  }
};

// anyone (e.g. patient) gets available schedule for specific doctor
exports.getDoctorSchedule = async (req, res) => {
  try {
    const { doctorid } = req.params;
    const schedule = await Schedule.findAll({
      where: { doctorid },
      include: [
        {
          model: Booking,
          as: 'scheduleBookings', // alias must match the one defined in index.js
          required: false
        }
      ]
    });
    // return only slots without any bookings
    const availableSlots = schedule.filter(slot => slot.scheduleBookings.length === 0);
    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get schedule', error: err.message });
  }
};
