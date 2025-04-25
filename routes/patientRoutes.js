const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.use(auth, permit('admin'));

router.get('/', controller.getAllPatients);
router.put('/:id', controller.updatePatient);
router.delete('/:id', controller.deletePatient);

module.exports = router;
