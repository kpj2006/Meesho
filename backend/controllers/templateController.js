const IssueTemplate = require('../models/IssueTemplate');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const query = {
      $or: [
        { isPublic: true },
        { createdBy: req.user.id },
      ],
    };
    
    if (projectId) {
      query.$or.push({ projectId: projectId });
    }

    const templates = await IssueTemplate.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .sort({ usageCount: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const template = await IssueTemplate.create(req.body);

    const populatedTemplate = await IssueTemplate.findById(template._id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Use template to create issue
// @route   POST /api/templates/:id/use
// @access  Private
exports.useTemplate = async (req, res, next) => {
  try {
    const template = await IssueTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    // Return template data for issue creation
    const issueData = {
      title: template.title || req.body.title,
      description: template.defaultDescription || req.body.description,
      priority: template.defaultPriority,
      labels: template.defaultLabels || [],
      projectId: req.body.projectId || template.projectId,
    };

    res.status(200).json({
      success: true,
      data: issueData,
      template: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await IssueTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Only creator can delete
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template',
      });
    }

    await template.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    next(error);
  }
};

