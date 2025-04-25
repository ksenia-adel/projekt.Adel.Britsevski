const { User, Patient } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// registers a new patient user
exports.register = async (req, res) => {
  const {
    email, password, firstname, lastname, phone, address, personalcode
  } = req.body;

  try {
    // check if user with this email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    // hash password
    const hash = await bcrypt.hash(password, 10);
    // create user with role 'patient'
    const user = await User.create({ email, password: hash, role: 'patient' });
    // create patient and link with user
    const patient = await Patient.create({
      firstname,lastname,email,phone,address,personalcode,userid: user.userid
    });
    // generate jwt token
    const token = jwt.sign({ userid: user.userid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      message: 'Patient registered successfully', token, patient
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

// logs in a user (admin, doctor, or patient)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Looking for user:', email); // trying to find user in db
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found'); // user not found
      return res.status(404).json({ message: 'User not found' });
    }
    // check password match
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    // generate jwt token
    const token = jwt.sign({ userid: user.userid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { userid: user.userid, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Login error', error: e.message });
  }
};
