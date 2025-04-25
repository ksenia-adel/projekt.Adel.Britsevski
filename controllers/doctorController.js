const { Doctor, User } = require('../models');
const bcrypt = require('bcrypt');

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

exports.createDoctor = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, specialty } = req.body;
    const adminId = req.user.userid;

    // 1. Генерируем пароль
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 2. Создаём пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'doctor'
    });

    // 3. Создаём доктора
    const doctor = await Doctor.create({
      firstname,
      lastname,
      email,
      phone,
      specialty,
      userid: user.userid,
      adminid: adminId
    });

    // 4. Возвращаем данные + пароль (в идеале не логинить в проде)
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



exports.getAllDoctors = async (req, res) => {
  const doctors = await Doctor.findAll();
  res.json(doctors);
};

exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, specialty } = req.body;

  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Обновляем таблицу doctor
    await doctor.update({ firstname, lastname, email, phone, specialty });

    // Обновляем связанного user
    const user = await User.findByPk(doctor.userid);
    if (user) {
      await user.update({ email }); // можно добавить другие поля, если хочешь
    }

    res.json({ message: 'Doctor updated', doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Удаляем user
    await User.destroy({ where: { userid: doctor.userid } });

    // Удаляем doctor
    await Doctor.destroy({ where: { doctorid: id } });

    res.json({ message: 'Doctor and associated user deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
