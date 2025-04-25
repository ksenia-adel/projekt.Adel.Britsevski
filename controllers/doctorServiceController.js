const { DoctorService, Doctor, ServiceCatalog } = require('../models');

// links a service to the logged-in doctor
exports.createDoctorService = async (req, res) => {
  try {
    const { servicecatalogid } = req.body;
    const userid = req.user.userid;

    // find the doctor by userid
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found for this user' });

    const doctorid = doctor.doctorid;

    // check if service exists
    const service = await ServiceCatalog.findByPk(servicecatalogid);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // create the link between doctor and service
    const linked = await DoctorService.create({ doctorid, servicecatalogid });

    res.status(201).json({ message: 'Service linked to doctor', linked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to link service', error: err.message });
  }
};

// gets all services linked to a specific doctor (by doctorid in params)
exports.getDoctorServices = async (req, res) => {
  try {
    const { doctorid } = req.params;

    const services = await DoctorService.findAll({
      where: { doctorid },
      include: [ServiceCatalog] // include detailed service info
    });

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get doctor services', error: err.message });
  }
};

// removes a service from a doctor's list (only if the doctor owns it)
exports.deleteDoctorService = async (req, res) => {
  try {
    const { id } = req.params;
    const userid = req.user.userid;

    // find doctor by userid
    const doctor = await Doctor.findOne({ where: { userid } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const doctorid = doctor.doctorid;

    // find doctor-service link by ID
    const service = await DoctorService.findByPk(id);
    if (!service) return res.status(404).json({ message: 'Doctor service not found' });

    // ensure doctor owns this service
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
