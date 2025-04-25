const sequelize = require('../db');
const { Patient, Doctor, Booking, ServiceCatalog, Schedule, User, Statistic } = require('../models');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');


// Генерация случайного пароля
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

exports.createAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body;

    // Проверим, нет ли уже такого email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Генерируем пароль
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Создаём пользователя с ролью admin
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    // Создаём запись в таблице admin
    const admin = await Admin.create({
      firstname,
      lastname,
      email,
      phone,
      userid: user.userid
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin,
      login: {
        email,
        password: rawPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Admin creation failed', error: err.message });
  }
};


exports.getAllAdmins = async (req, res) => {
  const admins = await Admin.findAll();
  res.json(admins);
};

exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Обновим данные администратора
    await admin.update({ firstname, lastname, email, phone });


    // Обновим связанного пользователя
    const user = await User.findByPk(admin.userid);
    if (user) {
      if (user.email !== email) {
        const duplicate = await User.findOne({ where: { email } });
        if (duplicate) {
          return res.status(400).json({ message: 'Этот email уже используется другим пользователем' });
        }
      }
    
      await user.update({ email }); // здесь можно добавить phone, password и т.д.
    }     

    res.json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Сначала удалим admin
    await Admin.destroy({ where: { adminid: id } });

    // Затем удалим user
    await User.destroy({ where: { userid: admin.userid } });

    res.json({ message: 'Admin and associated user deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};



exports.getStatistics = async (req, res) => {
  try {
    // Подсчёты
    const patientCount = await Patient.count();
    const doctorCount = await Doctor.count();
    const bookingCount = await Booking.count();
    const serviceCount = await ServiceCatalog.count();

    // Топ 3 врача по бронированиям
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
    

    // Топ 3 услуги по количеству бронирований
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
    

// Сохраняем статистику
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
    if (!stat) {
      return res.status(404).json({ message: 'Statistic not found' });
    }

    await stat.destroy();
    res.json({ message: 'Statistic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete statistic', error: err.message });
  }
};