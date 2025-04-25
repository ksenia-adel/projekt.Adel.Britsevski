const { DoctorService, Doctor, ServiceCatalog } = require('../models');

exports.createDoctorService = async (req, res) => {
  try {
    const { servicecatalogid } = req.body;
    const userid = req.user.userid;

    // Найти врача по текущему пользователю
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found for this user' });

    const doctorid = doctor.doctorid;

    // Проверка существования услуги
    const service = await ServiceCatalog.findByPk(servicecatalogid);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Создать связь
    const linked = await DoctorService.create({ doctorid, servicecatalogid });

    res.status(201).json({ message: 'Service linked to doctor', linked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to link service', error: err.message });
  }
};


exports.getDoctorServices = async (req, res) => {
  try {
    const { doctorid } = req.params;

    const services = await DoctorService.findAll({
      where: { doctorid },
      include: [ServiceCatalog]
    });

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get doctor services', error: err.message });
  }
};

exports.deleteDoctorService = async (req, res) => {
    try {
      const { id } = req.params;
      const userid = req.user.userid;
  
      // Находим врача по userid
      const doctor = await Doctor.findOne({ where: { userid } });
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  
      const doctorid = doctor.doctorid;
  
      // Находим связку doctor-service
      const service = await DoctorService.findByPk(id);
      if (!service) return res.status(404).json({ message: 'Doctor service not found' });
  
      // Проверка: этот ли доктор владелец
      if (service.doctorid !== doctorid) {
        return res.status(403).json({ message: 'Access denied. This service does not belong to you.' });
      }
  
      await service.destroy();
      res.json({ message: 'Doctor service unlinked successfully' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to unlink service', error: err.message });
    }
  };
  
