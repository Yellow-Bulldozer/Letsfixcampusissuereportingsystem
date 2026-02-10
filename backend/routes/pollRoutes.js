const express = require('express');
const router = express.Router();
const {
  startPoll,
  getActivePoll,
  castVote,
  getPollResult,
  getAllPolls,
  closePoll,
  getPollStats,
  getMyVote
} = require('../controllers/pollController');
const { protect, isStudent, isAdmin } = require('../middlewares/auth');
const { voteValidation, pollIdValidation } = require('../middlewares/validation');
const { voteLimiter } = require('../middlewares/rateLimiter');

// Routes accessible by all authenticated users
router.get('/active', protect, getActivePoll);
router.get('/result', protect, getPollResult);

// Student-only routes
router.post('/vote', protect, isStudent, voteLimiter, voteValidation, castVote);
router.get('/my-vote', protect, isStudent, getMyVote);

// Admin-only routes
router.post('/start', protect, isAdmin, startPoll);
router.get('/', protect, isAdmin, getAllPolls);
router.put('/:id/close', protect, isAdmin, pollIdValidation, closePoll);
router.get('/stats', protect, isAdmin, getPollStats);

module.exports = router;
