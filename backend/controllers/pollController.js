const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const Issue = require('../models/Issue');
const { startWeeklyPoll, manualClosePoll } = require('../utils/pollAutomation');

/**
 * @desc    Start new poll (manual)
 * @route   POST /api/polls/start
 * @access  Private (Admin only)
 */
exports.startPoll = async (req, res, next) => {
  try {
    // Check if there's already an active poll
    const activePoll = await Poll.findOne({ isActive: true, isClosed: false });
    
    if (activePoll) {
      return res.status(400).json({
        success: false,
        message: 'An active poll already exists',
        data: activePoll
      });
    }
    
    // Start new poll
    const poll = await startWeeklyPoll();
    
    if (!poll) {
      return res.status(400).json({
        success: false,
        message: 'No verified issues available for polling'
      });
    }
    
    await poll.populate('issues');
    
    res.status(201).json({
      success: true,
      message: 'Poll started successfully',
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a custom poll with selected issues and custom duration
 * @route   POST /api/polls/start-custom
 * @access  Private (Admin only)
 */
exports.startCustomPoll = async (req, res, next) => {
  try {
    const { issueIds, durationHours } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'issueIds[] is required and must contain at least one issue'
      });
    }

    if (!durationHours || durationHours < 1 || durationHours > 168) {
      return res.status(400).json({
        success: false,
        message: 'durationHours is required and must be between 1 and 168 (7 days)'
      });
    }

    // Check if there's already an active poll
    const activePoll = await Poll.findOne({ isActive: true, isClosed: false });
    if (activePoll) {
      return res.status(400).json({
        success: false,
        message: 'An active poll already exists. Close it before starting a new one.',
        data: activePoll
      });
    }

    // Verify all issues exist
    const issues = await Issue.find({ _id: { $in: issueIds } });
    if (issues.length !== issueIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more issues not found'
      });
    }

    const now = new Date();
    const pollEndDate = new Date(now);
    pollEndDate.setHours(pollEndDate.getHours() + durationHours);

    // Use the past week as the nominal week range
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 4);
    weekEndDate.setHours(23, 59, 59, 999);

    const newPoll = await Poll.create({
      weekStartDate,
      weekEndDate,
      pollStartDate: now,
      pollEndDate,
      isActive: true,
      isClosed: false,
      issues: issueIds,
      totalVotes: 0,
      createdBy: req.user._id
    });

    await newPoll.populate('issues');

    res.status(201).json({
      success: true,
      message: `Poll started with ${issueIds.length} issue(s) for ${durationHours} hour(s)`,
      data: newPoll
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active poll
 * @route   GET /api/polls/active
 * @access  Private
 */
exports.getActivePoll = async (req, res, next) => {
  try {
    const poll = await Poll.getActivePoll();
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'No active poll available'
      });
    }
    
    // Populate issue details
    await poll.populate({
      path: 'issues',
      populate: {
        path: 'reportedBy',
        select: 'name email department'
      }
    });
    
    // Get vote counts for each issue
    const issueVoteCounts = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      {
        $group: {
          _id: '$issueId',
          voteCount: { $sum: 1 }
        }
      }
    ]);
    
    // Map vote counts to issues
    const issuesWithVotes = poll.issues.map(issue => {
      const voteData = issueVoteCounts.find(v => v._id.toString() === issue._id.toString());
      return {
        ...issue.toObject(),
        voteCount: voteData ? voteData.voteCount : 0
      };
    });
    
    // Check if current user has voted (if student)
    let hasVoted = false;
    if (req.user.role === 'student') {
      hasVoted = await Vote.hasStudentVoted(poll._id, req.user._id);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...poll.toObject(),
        issues: issuesWithVotes,
        hasVoted
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cast vote
 * @route   POST /api/polls/vote
 * @access  Private (Student only)
 */
exports.castVote = async (req, res, next) => {
  try {
    const { issueId } = req.body;
    
    // Get active poll
    const poll = await Poll.getActivePoll();
    
    if (!poll) {
      return res.status(400).json({
        success: false,
        message: 'No active poll available'
      });
    }
    
    // Check if poll is currently active
    if (!poll.isCurrentlyActive()) {
      return res.status(400).json({
        success: false,
        message: 'Poll is not currently active'
      });
    }
    
    // Check if issue is part of the poll
    const isIssueInPoll = poll.issues.some(issue => issue._id.toString() === issueId);
    
    if (!isIssueInPoll) {
      return res.status(400).json({
        success: false,
        message: 'Issue is not part of the current poll'
      });
    }
    
    // Check if student has already voted
    const hasVoted = await Vote.hasStudentVoted(poll._id, req.user._id);
    
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll'
      });
    }
    
    // Create vote
    const vote = await Vote.create({
      pollId: poll._id,
      issueId,
      studentId: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      data: vote
    });
  } catch (error) {
    // Handle duplicate vote error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get poll results
 * @route   GET /api/polls/result
 * @access  Private
 */
exports.getPollResult = async (req, res, next) => {
  try {
    const { pollId } = req.query;
    
    let poll;
    
    if (pollId) {
      // Get specific poll
      poll = await Poll.findById(pollId).populate({
        path: 'issues',
        populate: {
          path: 'reportedBy',
          select: 'name email department'
        }
      }).populate('winningIssue');
    } else {
      // Get latest closed poll
      poll = await Poll.findOne({ isClosed: true })
        .sort('-closedAt')
        .populate({
          path: 'issues',
          populate: {
            path: 'reportedBy',
            select: 'name email department'
          }
        })
        .populate('winningIssue');
    }
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'No poll results available'
      });
    }
    
    // Get vote counts for all issues
    const voteCounts = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      {
        $group: {
          _id: '$issueId',
          voteCount: { $sum: 1 }
        }
      },
      { $sort: { voteCount: -1 } }
    ]);
    
    // Map vote counts to issues
    const issuesWithVotes = poll.issues.map(issue => {
      const voteData = voteCounts.find(v => v._id.toString() === issue._id.toString());
      return {
        ...issue.toObject(),
        voteCount: voteData ? voteData.voteCount : 0,
        isWinner: poll.winningIssue && poll.winningIssue._id.toString() === issue._id.toString()
      };
    }).sort((a, b) => b.voteCount - a.voteCount);
    
    res.status(200).json({
      success: true,
      data: {
        ...poll.toObject(),
        issues: issuesWithVotes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all polls
 * @route   GET /api/polls
 * @access  Private (Admin)
 */
exports.getAllPolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const polls = await Poll.find()
      .populate('issues', 'title category status')
      .populate('winningIssue', 'title category')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Poll.countDocuments();
    
    res.status(200).json({
      success: true,
      count: polls.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: polls
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close poll manually
 * @route   PUT /api/polls/:id/close
 * @access  Private (Admin only)
 */
exports.closePoll = async (req, res, next) => {
  try {
    const result = await manualClosePoll(req.params.id);
    
    const poll = await Poll.findById(req.params.id)
      .populate('issues')
      .populate('winningIssue');
    
    res.status(200).json({
      success: true,
      message: 'Poll closed successfully',
      data: {
        poll,
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get poll statistics
 * @route   GET /api/polls/stats
 * @access  Private (Admin)
 */
exports.getPollStats = async (req, res, next) => {
  try {
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ isActive: true, isClosed: false });
    const closedPolls = await Poll.countDocuments({ isClosed: true });
    const totalVotes = await Vote.countDocuments();
    
    // Get average votes per poll
    const avgVotesPerPoll = closedPolls > 0 ? Math.round(totalVotes / closedPolls) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalPolls,
        activePolls,
        closedPolls,
        totalVotes,
        avgVotesPerPoll
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's vote in active poll
 * @route   GET /api/polls/my-vote
 * @access  Private (Student)
 */
exports.getMyVote = async (req, res, next) => {
  try {
    const activePoll = await Poll.getActivePoll();
    
    if (!activePoll) {
      return res.status(404).json({
        success: false,
        message: 'No active poll available'
      });
    }
    
    const vote = await Vote.findOne({
      pollId: activePoll._id,
      studentId: req.user._id
    }).populate('issueId', 'title category');
    
    res.status(200).json({
      success: true,
      data: vote
    });
  } catch (error) {
    next(error);
  }
};
