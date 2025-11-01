const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');

// @desc    Get all sprints
// @route   GET /api/sprints
// @access  Private
exports.getSprints = async (req, res, next) => {
  try {
    const { projectId, status } = req.query;

    const query = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const sprints = await Sprint.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .populate('issues')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sprints.length,
      data: sprints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sprint
// @route   GET /api/sprints/:id
// @access  Private
exports.getSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .populate('issues');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sprint
// @route   POST /api/sprints
// @access  Private
exports.createSprint = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const sprint = await Sprint.create(req.body);

    const populatedSprint = await Sprint.findById(sprint._id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedSprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private
exports.updateSprint = async (req, res, next) => {
  try {
    let sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .populate('issues');

    res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private
exports.deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Remove sprint from issues
    await Issue.updateMany({ sprintId: sprint._id }, { $unset: { sprintId: 1 } });

    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Sprint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprint analytics
// @route   GET /api/sprints/:id/analytics
// @access  Private
exports.getSprintAnalytics = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate('issues');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    const issues = sprint.issues;
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i) =>
      ['Resolved', 'Closed'].includes(i.status)
    ).length;

    const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

    const issuesByPriority = {
      Low: issues.filter((i) => i.priority === 'Low').length,
      Medium: issues.filter((i) => i.priority === 'Medium').length,
      High: issues.filter((i) => i.priority === 'High').length,
      Critical: issues.filter((i) => i.priority === 'Critical').length,
    };

    res.status(200).json({
      success: true,
      data: {
        totalIssues,
        completedIssues,
        completionRate: completionRate.toFixed(2),
        issuesByPriority,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

