const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
  fromIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  toIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  type: {
    type: String,
    enum: ['blocks', 'blocked_by', 'related_to', 'duplicate_of'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent circular dependencies
dependencySchema.index({ fromIssue: 1, toIssue: 1 });

module.exports = mongoose.model('Dependency', dependencySchema);

