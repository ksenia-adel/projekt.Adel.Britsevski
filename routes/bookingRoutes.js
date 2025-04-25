const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('patient'), controller.createBooking);
router.get('/', auth, permit('patient'), controller.getMyBookings);
router.delete('/:id', auth, permit('patient'), controller.cancelBooking);

router.put('/:id/pay', auth, permit('patient'), controller.payForBooking);


module.exports = router;
