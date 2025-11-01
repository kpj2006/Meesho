const express = require('express');
const router = express.Router();
const {
  sendSlackNotification,
  createGitHubIssue,
  syncWithFigma,
} = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');

router.post('/slack/notify', protect, sendSlackNotification);
router.post('/github/create-issue', protect, createGitHubIssue);
router.post('/figma/sync', protect, syncWithFigma);

module.exports = router;

