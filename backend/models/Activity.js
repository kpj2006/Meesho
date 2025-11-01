const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'issue_created',
      'issue_updated',
      'issue_assigned',
      'issue_status_changed',
      'issue_resolved',
      'issue_comment_added',
      'task_created',
      'task_assigned',
      'task_completed',
      'task_updated',
      'project_created',
      'project_updated',
      'comment_added',
      'user_mentioned',
      'status_change',
      'priority_change',
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ issue: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

