const express = require('express');
const router = express.Router();
const controller = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('admin'), controller.createDoctor);
router.get('/', auth, controller.getAllDoctors);
router.put('/:id', auth, permit('admin'), controller.updateDoctor);
router.delete('/:id', auth, permit('admin'), controller.deleteDoctor);

router.get('/bookings', auth, permit('doctor'), controller.getDoctorBookings);

module.exports = router;
