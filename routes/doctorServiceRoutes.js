const express = require('express');
const router = express.Router();
const controller = require('../controllers/doctorServiceController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('doctor', 'admin'), controller.createDoctorService);
router.get('/:doctorid', controller.getDoctorServices);
router.delete('/:id', auth, permit('doctor', 'admin'), controller.deleteDoctorService);

module.exports = router;
