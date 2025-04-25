const { DoctorService, Doctor, ServiceCatalog } = require('../models');

// get services for a specific doctor by doctorid (for patient or admin)
exports.getDoctorServicesById = async (req, res) => {
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

// get services for the currently logged-in doctor
exports.getMyDoctorServices = async (req, res) => {
  try {
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const services = await DoctorService.findAll({
      where: { doctorid: doctor.doctorid },
      include: [ServiceCatalog]
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get your services', error: err.message });
  }
};

// link a service to the logged-in doctor
exports.createDoctorService = async (req, res) => {
  try {
    const { servicecatalogid } = req.body;
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // check for duplicate service entry
    const exists = await DoctorService.findOne({
      where: { doctorid: doctor.doctorid, servicecatalogid }
    });
    if (exists) return res.status(400).json({ message: 'Service already linked to doctor' });
    const linked = await DoctorService.create({
      doctorid: doctor.doctorid,
      servicecatalogid
    });
    res.status(201).json({ message: 'Service linked to doctor', linked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to link service', error: err.message });
  }
};

// delete a doctor service (only if it belongs to the logged-in doctor)
exports.deleteDoctorService = async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const service = await DoctorService.findByPk(id);
    if (!service) return res.status(404).json({ message: 'Doctor service not found' });
    if (service.doctorid !== doctor.doctorid) {
      return res.status(403).json({ message: 'Access denied. This service does not belong to you.' });
    }
    await service.destroy();
    res.json({ message: 'Doctor service unlinked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to unlink service', error: err.message });
  }
};
