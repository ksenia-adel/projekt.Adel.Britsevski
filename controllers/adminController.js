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
      await user.update({ email }); // Можем добавить обновление других полей
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

    // Удалим user
    await User.destroy({ where: { userid: admin.userid } });

    // Удалим admin
    await Admin.destroy({ where: { adminid: id } });

    res.json({ message: 'Admin and associated user deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
