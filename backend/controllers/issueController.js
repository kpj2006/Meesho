const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { createActivity } = require('./activityController');

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo, search } = req.query;

    // Build query object
    const query = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .populate('sprintId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Private
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name createdBy')
      .populate('sprintId', 'name')
      .populate('resolution.resolvedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const issue = await Issue.create(req.body);

    const populatedIssue = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .populate('sprintId', 'name');

    // Create activity
    await createActivity({
      type: 'issue_created',
      description: `Created issue "${issue.title}"`,
      user: req.user.id,
      issue: issue._id,
      project: issue.projectId || null,
    });

    res.status(201).json({
      success: true,
      data: populatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res, next) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check ownership (optional: only creator or admin can update)
    // if (issue.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to update this issue',
    //   });
    // }

    issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .populate('sprintId', 'name');

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Delete all comments for this issue
    await Comment.deleteMany({ issueId: issue._id });

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Private
exports.getIssueComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ issueId: req.params.id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create comment for an issue
// @route   POST /api/issues/:id/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    req.body.issueId = req.params.id;
    req.body.createdBy = req.user.id;

    const comment = await Comment.create(req.body);

    const populatedComment = await Comment.findById(comment._id)
      .populate('createdBy', 'name email');

    // Get issue for activity
    const issue = await Issue.findById(req.params.id);

    // Create activity
    await createActivity({
      type: 'issue_comment_added',
      description: `Added a comment on issue`,
      user: req.user.id,
      issue: issue._id,
      project: issue.projectId || null,
      comment: comment._id,
    });

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close an issue
// @route   POST /api/issues/:id/close
// @access  Private (only project creator can close)
exports.closeIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('projectId', 'createdBy');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check if issue is resolved (must be Resolved to be closed)
    if (issue.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: issue.status === 'Closed' 
          ? 'Issue is already closed'
          : 'Issue must be resolved before it can be closed',
      });
    }

    // Check if user is the project creator
    const project = await Project.findById(issue.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project creator can close issues',
      });
    }

    // Update issue status to Closed
    issue.status = 'Closed';
    await issue.save();

    // Create activity
    await createActivity({
      type: 'issue_status_changed',
      description: `Closed issue "${issue.title}"`,
      user: req.user.id,
      issue: issue._id,
      project: issue.projectId || null,
    });

    // Populate the closed issue
    const closedIssue = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name createdBy')
      .populate('resolution.resolvedBy', 'name email')
      .populate('sprintId', 'name');

    res.status(200).json({
      success: true,
      data: closedIssue,
      message: 'Issue closed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve an issue
// @route   POST /api/issues/:id/resolve
// @access  Private (any authenticated user can resolve)
exports.resolveIssue = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check if already resolved
    if (issue.status === 'Resolved' || issue.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Issue is already resolved or closed',
      });
    }

    // Update issue with resolution details
    issue.status = 'Resolved';
    issue.resolution = {
      notes: resolutionNotes || 'Issue resolved',
      resolvedBy: req.user.id,
      resolvedAt: new Date(),
    };

    await issue.save();

    // Populate the resolved issue
    const resolvedIssue = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .populate('resolution.resolvedBy', 'name email')
      .populate('sprintId', 'name');

    // Create activity
    await createActivity({
      type: 'issue_resolved',
      description: `Resolved issue "${issue.title}"`,
      user: req.user.id,
      issue: issue._id,
      project: issue.projectId || null,
    });

    res.status(200).json({
      success: true,
      data: resolvedIssue,
      message: 'Issue resolved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update issues
// @route   POST /api/issues/bulk-update
// @access  Private
exports.bulkUpdate = async (req, res, next) => {
  try {
    const { issueIds, updates } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of issue IDs',
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fields to update',
      });
    }

    // Update all issues
    const result = await Issue.updateMany(
      { _id: { $in: issueIds } },
      { $set: updates },
      { runValidators: true }
    );

    // Get updated issues
    const updatedIssues = await Issue.find({ _id: { $in: issueIds } })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name');

    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      data: updatedIssues,
      message: `${result.modifiedCount} issue(s) updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete issues
// @route   POST /api/issues/bulk-delete
// @access  Private
exports.bulkDelete = async (req, res, next) => {
  try {
    const { issueIds } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of issue IDs',
      });
    }

    // Delete all comments for these issues
    await Comment.deleteMany({ issueId: { $in: issueIds } });

    // Delete issues
    const result = await Issue.deleteMany({ _id: { $in: issueIds } });

    res.status(200).json({
      success: true,
      count: result.deletedCount,
      message: `${result.deletedCount} issue(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

