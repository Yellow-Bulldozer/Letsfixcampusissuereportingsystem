const Issue = require('../models/Issue');
const { uploadToCloudinary } = require('../config/cloudinary');
const { checkDuplicateIssue, findSimilarIssues } = require('../utils/duplicateDetection');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Create new issue
 * @route   POST /api/issues
 * @access  Private (Student only)
 */
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    
    // Parse location if sent as string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    
    // Check for duplicate issues
    const duplicate = await checkDuplicateIssue(category, parsedLocation);
    
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A similar issue has been reported in this location within the last 24 hours',
        duplicateIssue: {
          id: duplicate._id,
          title: duplicate.title,
          status: duplicate.status,
          createdAt: duplicate.createdAt
        }
      });
    }
    
    // Handle image uploads
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      if (process.env.UPLOAD_METHOD === 'cloudinary') {
        // Upload to Cloudinary
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.buffer);
          imageUrls.push(url);
        }
      } else {
        // Local storage - return relative paths
        imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      }
    }
    
    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      location: parsedLocation,
      images: imageUrls,
      reportedBy: req.user._id
    });
    
    // Populate reporter info
    await issue.populate('reportedBy', 'name email department');
    
    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue
    });
  } catch (error) {
    // Clean up uploaded files on error (local storage)
    if (req.files && process.env.UPLOAD_METHOD !== 'cloudinary') {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }
    next(error);
  }
};

/**
 * @desc    Get all issues with filters
 * @route   GET /api/issues
 * @access  Private
 */
exports.getIssues = async (req, res, next) => {
  try {
    const {
      status,
      category,
      verified,
      block,
      floor,
      priority,
      isWeeklyPriority,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (verified !== undefined) query.verified = verified === 'true';
    if (block) query['location.block'] = block;
    if (floor) query['location.floor'] = floor;
    if (priority) query.priority = priority;
    if (isWeeklyPriority !== undefined) query.isWeeklyPriority = isWeeklyPriority === 'true';
    
    // Students can only see verified issues or their own
    if (req.user.role === 'student') {
      query.$or = [
        { verified: true },
        { reportedBy: req.user._id }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email department')
      .populate('verifiedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Issue.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: issues.length,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Private
 */
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email department')
      .populate('verifiedBy', 'name email')
      .populate('statusUpdates.updatedBy', 'name email role');
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Students can only view verified issues or their own
    if (req.user.role === 'student' && 
        !issue.verified && 
        issue.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this issue'
      });
    }
    
    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get issues by current user (student)
 * @route   GET /api/issues/my-issues
 * @access  Private (Student)
 */
exports.getMyIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue status
 * @route   PUT /api/issues/:id/status
 * @access  Private (Admin/Authority)
 */
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Update status
    issue.status = status;
    
    // Add status update to history
    issue.statusUpdates.push({
      status,
      updatedBy: req.user._id,
      comment: comment || `Status changed to ${status}`,
      timestamp: new Date()
    });
    
    await issue.save();
    
    await issue.populate('reportedBy', 'name email department');
    await issue.populate('statusUpdates.updatedBy', 'name email role');
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify/Unverify issue
 * @route   PUT /api/issues/:id/verify
 * @access  Private (Admin only)
 */
exports.verifyIssue = async (req, res, next) => {
  try {
    const { verified } = req.body;
    
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        verified,
        verifiedBy: verified ? req.user._id : null,
        verifiedAt: verified ? new Date() : null
      },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email department')
     .populate('verifiedBy', 'name email');
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Issue ${verified ? 'verified' : 'unverified'} successfully`,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/issues/stats/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    let stats = {};
    
    if (req.user.role === 'student') {
      // Student dashboard stats
      const myIssues = await Issue.countDocuments({ reportedBy: req.user._id });
      const pending = await Issue.countDocuments({ reportedBy: req.user._id, status: 'Pending' });
      const ongoing = await Issue.countDocuments({ reportedBy: req.user._id, status: 'Ongoing' });
      const completed = await Issue.countDocuments({ reportedBy: req.user._id, status: 'Completed' });
      
      stats = {
        totalIssues: myIssues,
        pending,
        ongoing,
        completed
      };
    } else if (req.user.role === 'admin') {
      // Admin dashboard stats
      const total = await Issue.countDocuments();
      const verified = await Issue.countDocuments({ verified: true });
      const unverified = await Issue.countDocuments({ verified: false });
      const pending = await Issue.countDocuments({ status: 'Pending' });
      const ongoing = await Issue.countDocuments({ status: 'Ongoing' });
      const completed = await Issue.countDocuments({ status: 'Completed' });
      
      stats = {
        total,
        verified,
        unverified,
        pending,
        ongoing,
        completed
      };
    } else if (req.user.role === 'authority') {
      // Authority dashboard stats
      const weeklyPriority = await Issue.countDocuments({ isWeeklyPriority: true, status: { $ne: 'Completed' } });
      const pending = await Issue.countDocuments({ status: 'Pending', verified: true });
      const ongoing = await Issue.countDocuments({ status: 'Ongoing' });
      const completed = await Issue.countDocuments({ status: 'Completed' });
      
      stats = {
        weeklyPriority,
        pending,
        ongoing,
        completed
      };
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get issues grouped by status
 * @route   GET /api/issues/grouped/status
 * @access  Private (Admin/Authority)
 */
exports.getIssuesGroupedByStatus = async (req, res, next) => {
  try {
    const grouped = await Issue.aggregate([
      { $match: { verified: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          issues: { $push: '$$ROOT' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly priority issue
 * @route   GET /api/issues/weekly-priority
 * @access  Private (Authority)
 */
exports.getWeeklyPriorityIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findOne({
      isWeeklyPriority: true,
      status: { $ne: 'Completed' }
    })
    .populate('reportedBy', 'name email department')
    .sort('-weeklyPriorityDate');
    
    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete issue
 * @route   DELETE /api/issues/:id
 * @access  Private (Admin only)
 */
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Delete associated images if local storage
    if (process.env.UPLOAD_METHOD !== 'cloudinary' && issue.images.length > 0) {
      for (const imagePath of issue.images) {
        try {
          const fullPath = path.join(__dirname, '..', imagePath);
          await fs.unlink(fullPath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }
    
    await issue.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge similar issues into one parent issue
 * @route   POST /api/issues/merge
 * @access  Private (Admin only)
 */
exports.mergeIssues = async (req, res, next) => {
  try {
    const { parentId, childIds } = req.body;

    if (!parentId || !childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'parentId and childIds[] are required'
      });
    }

    // Ensure parent exists
    const parentIssue = await Issue.findById(parentId);
    if (!parentIssue) {
      return res.status(404).json({
        success: false,
        message: 'Parent issue not found'
      });
    }

    // Ensure parent is not already merged into another issue
    if (parentIssue.mergedInto) {
      return res.status(400).json({
        success: false,
        message: 'Parent issue is already merged into another issue'
      });
    }

    // Validate all child IDs exist and are not already merged
    const children = await Issue.find({ _id: { $in: childIds } });
    if (children.length !== childIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more child issues not found'
      });
    }

    const alreadyMerged = children.filter(c => c.mergedInto);
    if (alreadyMerged.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${alreadyMerged.length} issue(s) are already merged into another issue`
      });
    }

    // Mark children as merged into parent
    await Issue.updateMany(
      { _id: { $in: childIds } },
      { $set: { mergedInto: parentId, mergedAt: new Date() } }
    );

    // Add children to parent's mergedChildren array (avoid duplicates)
    const existingChildIds = parentIssue.mergedChildren.map(id => id.toString());
    const newChildIds = childIds.filter(id => !existingChildIds.includes(id));
    parentIssue.mergedChildren.push(...newChildIds);
    parentIssue.mergedAt = parentIssue.mergedAt || new Date();
    await parentIssue.save();

    // Reload parent with populated data
    const updatedParent = await Issue.findById(parentId)
      .populate('reportedBy', 'name email department')
      .populate('mergedChildren', 'title category createdAt');

    res.status(200).json({
      success: true,
      message: `${childIds.length} issue(s) merged into "${parentIssue.title}"`,
      data: updatedParent
    });
  } catch (error) {
    next(error);
  }
};
