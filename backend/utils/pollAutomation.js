const Poll = require('../models/Poll');
const Issue = require('../models/Issue');
const Vote = require('../models/Vote');

/**
 * Start weekly poll automatically
 * Called by cron job every Saturday
 */
const startWeeklyPoll = async () => {
  try {
    console.log('Initializing weekly poll...');
    
    // Close any active polls first
    await closeActivePoll();
    
    // Get date range for the past week (Monday to Friday)
    const now = new Date();
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7); // Previous Monday
    weekStartDate.setHours(0, 0, 0, 0);
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 4); // Friday
    weekEndDate.setHours(23, 59, 59, 999);
    
    console.log(`Week range: ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`);
    
    // Get all verified issues from Monday to Friday that are still pending
    const eligibleIssues = await Issue.find({
      verified: true,
      createdAt: {
        $gte: weekStartDate,
        $lte: weekEndDate
      },
      status: 'Pending'
    }).select('_id');
    
    console.log(`Found ${eligibleIssues.length} eligible issues for polling`);
    
    // Don't create poll if no issues
    if (eligibleIssues.length === 0) {
      console.log('No verified issues to poll this week');
      return null;
    }
    
    // Poll runs for 24 hours starting now
    const pollStartDate = new Date();
    const pollEndDate = new Date(pollStartDate);
    pollEndDate.setHours(pollEndDate.getHours() + 24);
    
    // Create new poll
    const newPoll = await Poll.create({
      weekStartDate,
      weekEndDate,
      pollStartDate,
      pollEndDate,
      isActive: true,
      isClosed: false,
      issues: eligibleIssues.map(issue => issue._id),
      totalVotes: 0
    });
    
    console.log(`Poll created successfully with ID: ${newPoll._id}`);
    console.log(`Poll will close at: ${pollEndDate.toISOString()}`);
    
    return newPoll;
  } catch (error) {
    console.error('Error starting weekly poll:', error);
    throw error;
  }
};

/**
 * Close active poll and determine winner
 */
const closeActivePoll = async () => {
  try {
    // Find active polls that should be closed
    const activePolls = await Poll.find({
      isActive: true,
      isClosed: false,
      pollEndDate: { $lt: new Date() }
    });
    
    for (const poll of activePolls) {
      console.log(`Closing poll ${poll._id}...`);
      
      // Get vote counts for all issues in the poll
      const voteCounts = await Vote.aggregate([
        { $match: { pollId: poll._id } },
        {
          $group: {
            _id: '$issueId',
            voteCount: { $sum: 1 }
          }
        },
        { $sort: { voteCount: -1 } },
        { $limit: 1 }
      ]);
      
      let winningIssue = null;
      
      if (voteCounts.length > 0) {
        winningIssue = voteCounts[0]._id;
        
        // Mark the winning issue as weekly priority
        await Issue.findByIdAndUpdate(winningIssue, {
          isWeeklyPriority: true,
          weeklyPriorityDate: new Date(),
          priority: 'critical'
        });
        
        console.log(`Winning issue: ${winningIssue} with ${voteCounts[0].voteCount} votes`);
      }
      
      // Get total votes
      const totalVotes = await Vote.countDocuments({ pollId: poll._id });
      
      // Update poll as closed
      await Poll.findByIdAndUpdate(poll._id, {
        isClosed: true,
        isActive: false,
        winningIssue,
        totalVotes,
        closedAt: new Date()
      });
      
      console.log(`Poll ${poll._id} closed successfully`);
    }
  } catch (error) {
    console.error('Error closing active poll:', error);
    throw error;
  }
};

/**
 * Manual close poll (for admin use)
 */
const manualClosePoll = async (pollId) => {
  try {
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      throw new Error('Poll not found');
    }
    
    if (poll.isClosed) {
      throw new Error('Poll is already closed');
    }
    
    // Get vote counts
    const voteCounts = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      {
        $group: {
          _id: '$issueId',
          voteCount: { $sum: 1 }
        }
      },
      { $sort: { voteCount: -1 } },
      { $limit: 1 }
    ]);
    
    let winningIssue = null;
    
    if (voteCounts.length > 0) {
      winningIssue = voteCounts[0]._id;
      
      await Issue.findByIdAndUpdate(winningIssue, {
        isWeeklyPriority: true,
        weeklyPriorityDate: new Date(),
        priority: 'critical'
      });
    }
    
    const totalVotes = await Vote.countDocuments({ pollId: poll._id });
    
    await Poll.findByIdAndUpdate(pollId, {
      isClosed: true,
      isActive: false,
      winningIssue,
      totalVotes,
      closedAt: new Date()
    });
    
    return { winningIssue, totalVotes };
  } catch (error) {
    console.error('Error manually closing poll:', error);
    throw error;
  }
};

/**
 * Check and auto-close polls (called periodically)
 */
const checkAndClosePolls = async () => {
  try {
    const now = new Date();
    
    const pollsToClose = await Poll.find({
      isActive: true,
      isClosed: false,
      pollEndDate: { $lt: now }
    });
    
    if (pollsToClose.length > 0) {
      console.log(`Found ${pollsToClose.length} polls to close`);
      await closeActivePoll();
    }
  } catch (error) {
    console.error('Error checking polls:', error);
  }
};

module.exports = {
  startWeeklyPoll,
  closeActivePoll,
  manualClosePoll,
  checkAndClosePolls
};
