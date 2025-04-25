const { User, Patient } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  const {
    email,
    password,
    firstname,
    lastname,
    phone,
    address,
    personalcode
  } = req.body;

  try {
    // Проверка на существование пользователя
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Хешируем пароль
    const hash = await bcrypt.hash(password, 10);

    // Создаём user с ролью patient
    const user = await User.create({ email, password: hash, role: 'patient' });

    // Создаём пациента
    const patient = await Patient.create({
      firstname,
      lastname,
      email,
      phone,
      address,
      personalcode,
      userid: user.userid
    });

    // Генерируем токен
    const token = jwt.sign({ userid: user.userid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Пытаемся найти пользователя:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('Пользователь не найден в БД');
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userid: user.userid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { userid: user.userid, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Login error', error: e.message });
  }
};
