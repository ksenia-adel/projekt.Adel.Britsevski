const { Admin, User } = require('../models');
const bcrypt = require('bcrypt');

// generates a random password string
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

// creates a new admin and associated user account
exports.createAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body;

    // check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const rawPassword = generatePassword(); // generate plain password
    const hashedPassword = await bcrypt.hash(rawPassword, 10); // hash it with bcrypt

    // create user entry
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    // create admin entry linked with user
    const admin = await Admin.create({
      firstname,
      lastname,
      email,
      phone,
      userid: user.userid
    });

    // return created admin with login info
    res.status(201).json({
      message: 'Admin created successfully',
      admin,
      login: {
        email,
        password: rawPassword
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Admin creation failed', error: err.message });
  }
};

// returns list of all admins
exports.getAllAdmins = async (req, res) => {
  const admins = await Admin.findAll();
  res.json(admins);
};

// updates admin info and corresponding user email
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    await admin.update({ firstname, lastname, email, phone });

    // update user's email if it was changed and not taken
    const user = await User.findByPk(admin.userid);
    if (user) {
      if (user.email !== email) {
        const duplicate = await User.findOne({ where: { email } });
        if (duplicate) {
          return res.status(400).json({ message: 'A user with this email already exists' });
        }
      }

      await user.update({ email });
    }

    res.json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// deletes admin and its linked user
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    await Admin.destroy({ where: { adminid: id } });
    await User.destroy({ where: { userid: admin.userid } });

    res.json({ message: 'Admin and associated user deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
