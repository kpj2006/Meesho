const Dependency = require('../models/Dependency');
const Issue = require('../models/Issue');

// @desc    Create dependency
// @route   POST /api/dependencies
// @access  Private
exports.createDependency = async (req, res, next) => {
  try {
    const { fromIssue, toIssue, type, description } = req.body;

    // Prevent self-dependency
    if (fromIssue === toIssue) {
      return res.status(400).json({
        success: false,
        message: 'Issue cannot depend on itself',
      });
    }

    // Check if dependency already exists
    const existing = await Dependency.findOne({ fromIssue, toIssue, type });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This dependency already exists',
      });
    }

    // Verify both issues exist
    const [issue1, issue2] = await Promise.all([
      Issue.findById(fromIssue),
      Issue.findById(toIssue),
    ]);

    if (!issue1 || !issue2) {
      return res.status(404).json({
        success: false,
        message: 'One or both issues not found',
      });
    }

    const dependency = await Dependency.create({
      fromIssue,
      toIssue,
      type,
      description,
    });

    res.status(201).json({
      success: true,
      data: dependency,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dependencies for an issue
// @route   GET /api/dependencies/issue/:id
// @access  Private
exports.getIssueDependencies = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    const dependencies = await Dependency.find({
      $or: [{ fromIssue: issueId }, { toIssue: issueId }],
    })
      .populate('fromIssue', 'title status priority')
      .populate('toIssue', 'title status priority')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dependencies.length,
      data: dependencies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dependency graph for project
// @route   GET /api/dependencies/project/:id
// @access  Private
exports.getProjectDependencies = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Get all issues in project
    const issues = await Issue.find({ projectId }).select('_id title status priority');

    const issueIds = issues.map((i) => i._id);

    const dependencies = await Dependency.find({
      $or: [{ fromIssue: { $in: issueIds } }, { toIssue: { $in: issueIds } }],
    })
      .populate('fromIssue', 'title status priority')
      .populate('toIssue', 'title status priority')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dependencies.length,
      data: dependencies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete dependency
// @route   DELETE /api/dependencies/:id
// @access  Private
exports.deleteDependency = async (req, res, next) => {
  try {
    const dependency = await Dependency.findById(req.params.id);

    if (!dependency) {
      return res.status(404).json({
        success: false,
        message: 'Dependency not found',
      });
    }

    await dependency.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Dependency deleted',
    });
  } catch (error) {
    next(error);
  }
};

