const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: [true, 'Poll ID is required']
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: [true, 'Issue ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
voteSchema.index({ pollId: 1, studentId: 1 });
voteSchema.index({ issueId: 1 });
voteSchema.index({ pollId: 1, issueId: 1 });

// Compound unique index to ensure one vote per student per poll
voteSchema.index(
  { pollId: 1, studentId: 1 },
  { unique: true }
);

// Pre-save validation to ensure student role
voteSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const student = await User.findById(this.studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    if (student.role !== 'student') {
      throw new Error('Only students can vote');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get vote counts for a poll
voteSchema.statics.getVoteCountsByPoll = async function(pollId) {
  return await this.aggregate([
    { $match: { pollId: mongoose.Types.ObjectId(pollId) } },
    {
      $group: {
        _id: '$issueId',
        voteCount: { $sum: 1 }
      }
    },
    { $sort: { voteCount: -1 } }
  ]);
};

// Static method to check if student has voted in poll
voteSchema.statics.hasStudentVoted = async function(pollId, studentId) {
  const vote = await this.findOne({ pollId, studentId });
  return !!vote;
};

module.exports = mongoose.model('Vote', voteSchema);
