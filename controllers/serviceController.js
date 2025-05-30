const { ServiceCatalog } = require('../models');

// admin creates a new service
exports.createService = async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const adminId = req.user.userid; // get admin ID from token
    const service = await ServiceCatalog.create({
      name,
      description,
      duration,
      price,
      adminid: adminId
    });
    res.status(201).json({ message: 'Service created', service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create service', error: err.message });
  }
};

// get list of all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await ServiceCatalog.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

// admin updates a specific service by id
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ServiceCatalog.update(req.body, {
      where: { servicecatalogid: id }
    });
    res.json({ message: 'Service updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update service', error: err.message });
  }
};

// admin deletes a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await ServiceCatalog.destroy({ where: { servicecatalogid: id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service', error: err.message });
  }
};
