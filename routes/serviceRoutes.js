const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('admin'), serviceController.createService);
router.get('/', serviceController.getAllServices);
router.put('/:id', auth, permit('admin'), serviceController.updateService);
router.delete('/:id', auth, permit('admin'), serviceController.deleteService);


module.exports = router;
