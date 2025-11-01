const express = require('express');
const router = express.Router();
const { aiTriage, checkDuplicates, applyTriage, smartAutoAssign } = require('../controllers/triageController');
const { protect } = require('../middleware/auth');

router.post('/ai', protect, aiTriage);
router.post('/duplicates', protect, checkDuplicates);
router.post('/auto-assign', protect, smartAutoAssign);

module.exports = router;

