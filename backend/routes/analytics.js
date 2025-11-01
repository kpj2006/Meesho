const express = require('express');
const router = express.Router();
const {
  getVelocity,
  getCapacity,
  getBurndown,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/velocity', protect, getVelocity);
router.get('/capacity', protect, getCapacity);
router.get('/burndown', protect, getBurndown);

module.exports = router;

