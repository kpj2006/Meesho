const express = require('express');
const router = express.Router();
const {
  getActivities,
  getMyActivities,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getActivities);
router.get('/me', protect, getMyActivities);

module.exports = router;

