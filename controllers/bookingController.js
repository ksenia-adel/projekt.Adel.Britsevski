const { Booking, Patient, Schedule, ServiceCatalog } = require('../models');

// creates a new booking for a patient
exports.createBooking = async (req, res) => {
  try {
    const { servicecatalogid, scheduleid } = req.body;
    const userid = req.user.userid;

    const patient = await Patient.findOne({ where: { userid } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // check if slot is already booked
    const existing = await Booking.findOne({ where: { scheduleid } });
    if (existing) return res.status(400).json({ message: 'Schedule slot already booked' });

    // fetch service and schedule info
    const service = await ServiceCatalog.findByPk(servicecatalogid);
    const schedule = await Schedule.findByPk(scheduleid);

    if (!service || !schedule) {
      return res.status(404).json({ message: 'Service or schedule not found' });
    }

    // check if the slot has enough time for the service
    const start = new Date(`1970-01-01T${schedule.starttime}`);
    const end = new Date(`1970-01-01T${schedule.endtime}`);
    const diffInMinutes = (end - start) / (1000 * 60);

    if (diffInMinutes < service.duration) {
      return res.status(400).json({
        message: `Selected time slot (${diffInMinutes} min) is too short for this service (${service.duration} min)`
      });
    }

    // create booking entry
    const booking = await Booking.create({
      patientid: patient.patientid,
      servicecatalogid,
      scheduleid
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

// gets bookings for the logged-in patient
exports.getMyBookings = async (req, res) => {
  try {
    const userid = req.user.userid;
    const patient = await Patient.findOne({ where: { userid } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const bookings = await Booking.findAll({
      where: { patientid: patient.patientid },
      include: [Schedule, ServiceCatalog] // include schedule and service info
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get bookings', error: err.message });
  }
};

// cancels a booking (only by the same patient)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;

    const patient = await Patient.findOne({ where: { userid } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.patientid !== patient.patientid) {
      return res.status(403).json({ message: 'Cannot cancel other patient\'s booking' });
    }

    await booking.destroy();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message });
  }
};

// marks a booking as paid
exports.payForBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;

    const patient = await Patient.findOne({ where: { userid } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.patientid !== patient.patientid) {
      return res.status(403).json({ message: 'You cannot pay for someone else’s booking' });
    }

    if (booking.ispaid) {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    await booking.update({ ispaid: true });

    res.json({ message: 'Booking marked as paid', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to pay for booking', error: err.message });
  }
};
