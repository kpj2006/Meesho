const express = require('express');
const router = express.Router();
const {
  createDependency,
  getIssueDependencies,
  getProjectDependencies,
  deleteDependency,
} = require('../controllers/dependencyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createDependency);
router.get('/issue/:id', protect, getIssueDependencies);
router.get('/project/:id', protect, getProjectDependencies);
router.delete('/:id', protect, deleteDependency);

module.exports = router;

