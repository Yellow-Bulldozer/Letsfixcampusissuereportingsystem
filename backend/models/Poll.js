const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  pollStartDate: {
    type: Date,
    required: true
  },
  pollEndDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  issues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  winningIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
pollSchema.index({ isActive: 1 });
pollSchema.index({ isClosed: 1 });
pollSchema.index({ pollStartDate: -1 });
pollSchema.index({ weekStartDate: 1, weekEndDate: 1 });

// Method to check if poll is currently active
pollSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         !this.isClosed && 
         now >= this.pollStartDate && 
         now <= this.pollEndDate;
};

// Method to check if poll should be closed
pollSchema.methods.shouldBeClosed = function() {
  const now = new Date();
  return now > this.pollEndDate && !this.isClosed;
};

// Static method to get active poll
pollSchema.statics.getActivePoll = async function() {
  const now = new Date();
  return await this.findOne({
    isActive: true,
    isClosed: false,
    pollStartDate: { $lte: now },
    pollEndDate: { $gte: now }
  }).populate('issues');
};

module.exports = mongoose.model('Poll', pollSchema);
