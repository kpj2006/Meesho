const mongoose = require('mongoose');

const issueTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a template name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  defaultDescription: {
    type: String,
    default: '',
  },
  defaultPriority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  defaultLabels: [
    {
      type: String,
    },
  ],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('IssueTemplate', issueTemplateSchema);

