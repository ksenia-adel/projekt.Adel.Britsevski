const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('doctor'), controller.createSlot);
router.get('/', auth, permit('doctor'), controller.getMySchedule);
router.delete('/:id', auth, permit('doctor'), controller.deleteSlot);

router.get('/doctor/:doctorid', controller.getDoctorSchedule);


module.exports = router;
