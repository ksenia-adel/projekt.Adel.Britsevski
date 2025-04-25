const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.post('/', auth, permit('admin'), controller.createAdmin);
router.get('/', auth, permit('admin'), controller.getAllAdmins);
router.put('/:id', auth, permit('admin'), controller.updateAdmin);
router.delete('/:id', auth, permit('admin'), controller.deleteAdmin);

router.get('/stats', auth, permit('admin'), controller.getStatistics);
router.delete('/stats/:id', auth, permit('admin'), controller.deleteStatistic);

module.exports = router;
