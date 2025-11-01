const express = require('express');
const router = express.Router();
const {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  getSprintAnalytics,
} = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSprints);
router.get('/:id', protect, getSprint);
router.get('/:id/analytics', protect, getSprintAnalytics);
router.post('/', protect, createSprint);
router.put('/:id', protect, updateSprint);
router.delete('/:id', protect, deleteSprint);

module.exports = router;

