const axios = require('axios');
const Issue = require('../models/Issue');

// @desc    Send Slack notification
// @route   POST /api/integrations/slack/notify
// @access  Private
exports.sendSlackNotification = async (req, res, next) => {
  try {
    const { message, issueId } = req.body;

    if (!process.env.SLACK_WEBHOOK_URL) {
      return res.status(200).json({
        success: true,
        message: 'Slack webhook not configured',
      });
    }

    const issue = issueId ? await Issue.findById(issueId).populate('createdBy', 'name') : null;

    const slackMessage = {
      text: issue ? `New Issue: ${issue.title}` : message,
      blocks: issue
        ? [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🐛 New Issue Created`,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Title:*\n${issue.title}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Status:*\n${issue.status}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Priority:*\n${issue.priority}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Created By:*\n${issue.createdBy.name}`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Description:*\n${issue.description}`,
              },
            },
          ]
        : [
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: message,
              },
            },
          ],
    };

    await axios.post(process.env.SLACK_WEBHOOK_URL, slackMessage);

    res.status(200).json({
      success: true,
      message: 'Slack notification sent',
    });
  } catch (error) {
    console.error('Slack notification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send Slack notification',
    });
  }
};

// @desc    Create GitHub issue
// @route   POST /api/integrations/github/create-issue
// @access  Private
exports.createGitHubIssue = async (req, res, next) => {
  try {
    const { title, body, repo, owner } = req.body;

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'GitHub integration not configured',
      });
    }

    // This is a placeholder - you would need GitHub OAuth token from user
    // For full implementation, user should authorize and store their GitHub token

    res.status(200).json({
      success: true,
      message: 'GitHub issue creation requires user authorization',
      data: {
        title,
        body,
        repo,
        owner,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync issue with Figma
// @route   POST /api/integrations/figma/sync
// @access  Private
exports.syncWithFigma = async (req, res, next) => {
  try {
    const { issueId, figmaUrl } = req.body;

    if (!issueId || !figmaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID and Figma URL required',
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Attach Figma URL to issue
    issue.attachments = issue.attachments || [];
    issue.attachments.push({
      url: figmaUrl,
      filename: 'Figma Design',
      uploadedAt: new Date(),
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Figma URL attached to issue',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

