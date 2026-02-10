const Issue = require('../models/Issue');

/**
 * Check for duplicate issues
 * Detects similar issues based on location and category within 24 hours
 */
const checkDuplicateIssue = async (category, location) => {
  try {
    // Check for issues in the same location and category within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const duplicateIssue = await Issue.findOne({
      category: category,
      'location.block': location.block,
      'location.floor': location.floor,
      'location.room': location.room || 'N/A',
      createdAt: { $gte: twentyFourHoursAgo },
      status: { $ne: 'Completed' } // Don't check completed issues
    }).select('_id title status createdAt');
    
    return duplicateIssue;
  } catch (error) {
    console.error('Error checking duplicate issue:', error);
    return null;
  }
};

/**
 * Find similar issues based on title and description
 */
const findSimilarIssues = async (title, description, excludeId = null) => {
  try {
    // Simple text matching - in production, use full-text search or AI
    const keywords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) {
      return [];
    }
    
    const query = {
      $or: keywords.map(keyword => ({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      })),
      status: { $ne: 'Completed' }
    };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const similarIssues = await Issue.find(query)
      .select('_id title category status location createdAt')
      .limit(5);
    
    return similarIssues;
  } catch (error) {
    console.error('Error finding similar issues:', error);
    return [];
  }
};

module.exports = {
  checkDuplicateIssue,
  findSimilarIssues
};
