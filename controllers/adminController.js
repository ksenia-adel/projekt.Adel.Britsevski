const { Admin, User } = require('../models');
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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin'
    });

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

    await admin.update({ firstname, lastname, email, phone });

    const user = await User.findByPk(admin.userid);
    if (user) {
      if (user.email !== email) {
        const duplicate = await User.findOne({ where: { email } });
        if (duplicate) {
          return res.status(400).json({ message: 'Этот email уже используется другим пользователем' });
        }
      }

      await user.update({ email });
    }

    res.json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

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
