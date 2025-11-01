const express = require('express');
const router = express.Router();
const {
  getTemplates,
  createTemplate,
  useTemplate,
  deleteTemplate,
} = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTemplates);
router.post('/', protect, createTemplate);
router.post('/:id/use', protect, useTemplate);
router.delete('/:id', protect, deleteTemplate);

module.exports = router;

