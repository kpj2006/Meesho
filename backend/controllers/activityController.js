const Activity = require('../models/Activity');
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// Create activity helper
exports.createActivity = async (data) => {
  try {
    const activity = await Activity.create(data);
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// @desc    Get activity feed
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const { projectId, issueId, limit = 50 } = req.query;

    const query = {};
    if (projectId) query.project = projectId;
    if (issueId) query.issue = issueId;

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('issue', 'title status priority')
      .populate('task', 'title status priority')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity feed
// @route   GET /api/activities/me
// @access  Private
exports.getMyActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .populate('issue', 'title status priority')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

