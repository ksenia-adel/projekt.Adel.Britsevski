const { Patient, Doctor, Booking, ServiceCatalog, Schedule, User, Statistic } = require('../models');
const Sequelize = require('sequelize');

exports.getStatistics = async (req, res) => {
  try {
    const patientCount = await Patient.count();
    const doctorCount = await Doctor.count();
    const bookingCount = await Booking.count();
    const serviceCount = await ServiceCatalog.count();

    const topDoctors = await Booking.findAll({
      attributes: [
        'scheduleid',
        [Sequelize.fn('COUNT', Sequelize.col('bookingid')), 'count']
      ],
      include: [
        {
          model: Schedule,
          as: 'scheduleSlot',
          include: [
            {
              model: Doctor,
              include: [{ model: User }]
            }
          ]
        }
      ],
      group: [
        'booking.scheduleid',
        'scheduleSlot.scheduleid',
        'scheduleSlot.doctor.doctorid',
        'scheduleSlot.doctor.user.userid'
      ],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 3
    });

    const topServices = await Booking.findAll({
      attributes: [
        'servicecatalogid',
        [Sequelize.fn('COUNT', Sequelize.col('booking.bookingid')), 'count']
      ],
      include: [{ model: ServiceCatalog }],
      group: ['booking.servicecatalogid', 'servicecatalog.servicecatalogid'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 3
    });

    await Statistic.create({
      reporttype: 'summary',
      generateddate: new Date(),
      adminid: req.user.userid,
      reportcontent: JSON.stringify({
        total: {
          patients: patientCount,
          doctors: doctorCount,
          bookings: bookingCount,
          services: serviceCount
        },
        topDoctors,
        topServices
      })
    });

    res.json({
      total: {
        patients: patientCount,
        doctors: doctorCount,
        bookings: bookingCount,
        services: serviceCount
      },
      topDoctors,
      topServices
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get statistics', error: err.message });
  }
};

exports.deleteStatistic = async (req, res) => {
  try {
    const { id } = req.params;

    const stat = await Statistic.findByPk(id);
    if (!stat) return res.status(404).json({ message: 'Statistic not found' });

    await stat.destroy();
    res.json({ message: 'Statistic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete statistic', error: err.message });
  }
};
