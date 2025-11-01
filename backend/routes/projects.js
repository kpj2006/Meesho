const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectAnalytics,
  importFromGitHub,
  analyzeProject,
  analyzeSourceCode,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.get('/:id/analytics', protect, getProjectAnalytics);
router.post('/', protect, createProject);
router.post('/import-github', protect, importFromGitHub);
router.post('/:id/analyze', protect, analyzeProject);
router.post('/:id/analyze-code', protect, analyzeSourceCode);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;

