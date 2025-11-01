const Task = require('../models/Task');
const User = require('../models/User');
const { createActivity } = require('./activityController');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { assignedTo, status, priority, projectId, myTasksOnly } = req.query;
    const query = {};

    // If myTasksOnly is true, show only tasks assigned to current user (even for admins)
    // Otherwise, if user is not admin, only show tasks assigned to them
    if (myTasksOnly === 'true' || myTasksOnly === true) {
      query.assignedTo = req.user.id;
    } else if (req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.projectId = projectId;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('projectId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user has access (admin or assigned user)
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task (Admin only)
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, projectId, priority, dueDate, tags } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and assignedTo',
      });
    }

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found',
      });
    }

    const taskData = {
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user.id,
      projectId: projectId || null,
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      tags: tags || [],
    };

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name');

    // Create activity
    await createActivity({
      type: 'task_created',
      description: `Task "${task.title}" assigned to ${assignedUser.name}`,
      user: req.user.id,
      task: task._id,
      project: task.projectId || null,
    });

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check permissions: Admin can update any task, users can only update their assigned tasks
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    // Only admin can change assignedTo and assignedBy
    if (req.body.assignedTo && req.user.role !== 'admin') {
      delete req.body.assignedTo;
    }
    if (req.body.assignedBy && req.user.role !== 'admin') {
      delete req.body.assignedBy;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('projectId', 'name');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete task
// @route   POST /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
  try {
    const { completionNotes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user is assigned to this task or is admin
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this task',
      });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Task is already completed',
      });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.completedBy = req.user.id;
    task.completionNotes = completionNotes || '';

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('projectId', 'name');

    // Create activity
    await createActivity({
      type: 'task_completed',
      description: `Completed task "${task.title}"`,
      user: req.user.id,
      task: task._id,
      project: task.projectId || null,
    });

    res.status(200).json({
      success: true,
      data: populatedTask,
      message: 'Task marked as completed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

