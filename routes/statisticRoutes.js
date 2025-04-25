const express = require('express');
const router = express.Router();
const controller = require('../controllers/statisticController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.get('/', auth, permit('admin'), controller.getStatistics);
router.delete('/:id', auth, permit('admin'), controller.deleteStatistic);

module.exports = router;
