const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an issue title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide an issue description'],
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
  },
  labels: [
    {
      type: String,
    },
  ],
  attachments: [
    {
      url: String,
      filename: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  aiTriage: {
    suggestedCategory: String,
    confidence: Number,
    duplicateCheck: Boolean,
    analysis: String,
  },
  githubIssue: {
    number: Number,
    url: String,
    state: String,
    created_at: Date,
    updated_at: Date,
  },
  codeLocation: {
    filePath: String,
    lineNumber: Number,
    branch: String,
    repository: String,
  },
  resolution: {
    notes: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
issueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Issue', issueSchema);

