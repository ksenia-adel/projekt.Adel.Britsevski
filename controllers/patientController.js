const { Patient, User } = require('../models');

// Получить всех пациентов
exports.getAllPatients = async (req, res) => {
  const patients = await Patient.findAll({ include: ['user'] });
  res.json(patients);
};

// Обновить пациента
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, phone, personalcode, address } = req.body;

  const patient = await Patient.findByPk(id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  await patient.update({ firstname, lastname, phone, personalcode, address });

  const user = await User.findByPk(patient.userid);
  if (user) await user.update({ email });

  res.json({ message: 'Patient updated', patient });
};

// Удалить пациента
exports.deletePatient = async (req, res) => {
    try {
      const { id } = req.params;
  
      const patient = await Patient.findByPk(id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Удаляем patient
      await Patient.destroy({ where: { patientid: id } });
  
      // Затем удаляем связанного user
      await User.destroy({ where: { userid: patient.userid } });
  
      res.json({ message: 'Patient deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete patient', error: err.message });
    }
  };
  