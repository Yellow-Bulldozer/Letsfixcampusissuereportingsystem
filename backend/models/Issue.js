const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an issue title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: [
        'bench',
        'water',
        'electrical',
        'washroom',
        'classroom',
        'infrastructure',
        'internet',
        'security',
        'cleanliness',
        'other'
      ],
      message: 'Invalid category selected'
    }
  },
  images: [{
    type: String, // URL or file path
    trim: true
  }],
  location: {
    block: {
      type: String,
      required: [true, 'Please specify the block'],
      trim: true
    },
    floor: {
      type: String,
      required: [true, 'Please specify the floor'],
      trim: true
    },
    room: {
      type: String,
      trim: true,
      default: 'N/A'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Ongoing', 'Completed'],
      message: 'Status must be Pending, Ongoing, or Completed'
    },
    default: 'Pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isWeeklyPriority: {
    type: Boolean,
    default: false
  },
  weeklyPriorityDate: {
    type: Date
  },
  statusUpdates: [{
    status: {
      type: String,
      enum: ['Pending', 'Ongoing', 'Completed']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  mergedInto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  mergedChildren: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  mergedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ verified: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ 'location.block': 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ isWeeklyPriority: 1 });

// Compound index for duplicate detection
issueSchema.index({
  'location.block': 1,
  'location.floor': 1,
  'location.room': 1,
  category: 1,
  createdAt: -1
});

// Virtual for vote count (populated from Vote model)
issueSchema.virtual('voteCount', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'issueId',
  count: true
});

// Ensure virtuals are included in JSON
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);
