const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin-only routes
router.post('/', authorize('admin'), createTask);
router.delete('/:id', authorize('admin'), deleteTask);

// All authenticated users
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.post('/:id/complete', completeTask);

module.exports = router;

