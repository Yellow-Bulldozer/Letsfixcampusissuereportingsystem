const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssue,
  getMyIssues,
  updateIssueStatus,
  verifyIssue,
  getDashboardStats,
  getIssuesGroupedByStatus,
  getWeeklyPriorityIssue,
  deleteIssue,
  mergeIssues
} = require('../controllers/issueController');
const { protect, authorize, isStudent, isAdmin, isAuthority } = require('../middlewares/auth');
const {
  createIssueValidation,
  updateStatusValidation,
  verifyIssueValidation,
  issueIdValidation
} = require('../middlewares/validation');
const upload = require('../config/multer');

// Routes accessible by all authenticated users
router.get('/', protect, getIssues);
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/:id', protect, issueIdValidation, getIssue);

// Student-only routes
router.post(
  '/',
  protect,
  isStudent,
  upload.array('images', 5),
  createIssueValidation,
  createIssue
);
router.get('/my/issues', protect, isStudent, getMyIssues);

// Admin-only routes
router.put(
  '/:id/verify',
  protect,
  isAdmin,
  verifyIssueValidation,
  verifyIssue
);
router.get('/grouped/status', protect, isAdmin, getIssuesGroupedByStatus);
router.delete('/:id', protect, isAdmin, issueIdValidation, deleteIssue);
router.post('/merge', protect, isAdmin, mergeIssues);

// Admin and Authority routes
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'authority'),
  updateStatusValidation,
  updateIssueStatus
);

// Authority-only routes
router.get('/weekly/priority', protect, isAuthority, getWeeklyPriorityIssue);

module.exports = router;
