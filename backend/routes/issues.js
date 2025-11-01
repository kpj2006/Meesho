const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueComments,
  createComment,
  bulkUpdate,
  bulkDelete,
  resolveIssue,
  closeIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

// Comment routes nested under issues
router.get('/:id/comments', protect, getIssueComments);
router.post('/:id/comments', protect, createComment);

// Issue resolution and close routes (must come before /:id to avoid conflict)
router.post('/:id/resolve', protect, resolveIssue);
router.post('/:id/close', protect, closeIssue);

// Issue routes
router.get('/', protect, getIssues);
router.get('/:id', protect, getIssue);
router.post('/', protect, createIssue);
router.post('/bulk-update', protect, bulkUpdate);
router.post('/bulk-delete', protect, bulkDelete);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);

module.exports = router;

