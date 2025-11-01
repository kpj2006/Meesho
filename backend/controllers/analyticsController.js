const Issue = require('../models/Issue');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get velocity metrics
// @route   GET /api/analytics/velocity
// @access  Private
exports.getVelocity = async (req, res, next) => {
  try {
    const { projectId, days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const query = { createdAt: { $gte: daysAgo } };
    if (projectId) query.projectId = projectId;

    // Get all resolved issues in the time period
    const resolvedIssues = await Issue.find({
      ...query,
      status: { $in: ['Resolved', 'Closed'] },
    });

    // Calculate velocity (issues resolved per day)
    const velocity = {};
    resolvedIssues.forEach((issue) => {
      const date = new Date(issue.updatedAt || issue.createdAt).toISOString().split('T')[0];
      velocity[date] = (velocity[date] || 0) + 1;
    });

    // Get weekly velocity
    const weeklyVelocity = {};
    resolvedIssues.forEach((issue) => {
      const date = new Date(issue.updatedAt || issue.createdAt);
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      weeklyVelocity[week] = (weeklyVelocity[week] || 0) + 1;
    });

    // Calculate average
    const dailyAvg = resolvedIssues.length / parseInt(days);
    const weeklyAvg = Object.values(weeklyVelocity).reduce((a, b) => a + b, 0) / Object.keys(weeklyVelocity).length || 0;

    res.status(200).json({
      success: true,
      data: {
        dailyVelocity: velocity,
        weeklyVelocity: weeklyVelocity,
        averageDaily: dailyAvg.toFixed(2),
        averageWeekly: weeklyAvg.toFixed(2),
        totalResolved: resolvedIssues.length,
        period: `${days} days`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get capacity planning
// @route   GET /api/analytics/capacity
// @access  Private
exports.getCapacity = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    const query = { status: { $in: ['Open', 'In Progress'] } };
    if (projectId) query.projectId = projectId;

    // Get all open issues
    const openIssues = await Issue.find(query).populate('assignedTo', 'name email');

    // Calculate workload per user
    const workload = {};
    openIssues.forEach((issue) => {
      if (issue.assignedTo) {
        const userId = issue.assignedTo._id.toString();
        workload[userId] = {
          user: {
            _id: issue.assignedTo._id,
            name: issue.assignedTo.name,
            email: issue.assignedTo.email,
          },
          openIssues: (workload[userId]?.openIssues || 0) + 1,
          inProgress: issue.status === 'In Progress' ? (workload[userId]?.inProgress || 0) + 1 : (workload[userId]?.inProgress || 0),
        };
      }
    });

    // Calculate unassigned
    const unassigned = openIssues.filter((i) => !i.assignedTo).length;

    res.status(200).json({
      success: true,
      data: {
        workload: Object.values(workload),
        unassigned,
        totalOpen: openIssues.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get burndown chart data
// @route   GET /api/analytics/burndown
// @access  Private
exports.getBurndown = async (req, res, next) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    const query = {};
    if (projectId) query.projectId = projectId;

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default 30 days

    const end = endDate ? new Date(endDate) : new Date();

    // Get all issues in period
    const issues = await Issue.find({
      ...query,
      createdAt: { $gte: start, $lte: end },
    });

    // Calculate burndown per day
    const burndown = {};
    let remaining = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayIssues = issues.filter((i) => {
        const issueDate = new Date(i.createdAt).toISOString().split('T')[0];
        return issueDate <= dateStr;
      });

      const resolved = dayIssues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
      remaining = dayIssues.length - resolved;
      burndown[dateStr] = {
        total: dayIssues.length,
        resolved,
        remaining,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        burndown,
        startDate: start,
        endDate: end,
      },
    });
  } catch (error) {
    next(error);
  }
};

