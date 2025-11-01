const mongoose = require('mongoose');

const roadmapMilestoneSchema = new mongoose.Schema({
  milestone: {
    type: String,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed'],
    default: 'planned',
  },
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
  },
  sprints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
    },
  ],
  roadmap: [roadmapMilestoneSchema],
  githubRepo: {
    owner: String,
    repo: String,
    url: String,
    stars: Number,
    forks: Number,
    language: String,
    openIssues: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);

