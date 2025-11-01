const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateLastActive,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createUser);
router.delete('/:id', authorize('admin'), deleteUser);
// Allow all authenticated users to view users list
router.get('/', getUsers);

// General user routes
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/last-active', updateLastActive);

module.exports = router;

