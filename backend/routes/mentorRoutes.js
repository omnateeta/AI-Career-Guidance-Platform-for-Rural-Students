const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllMentors,
  getMentorDetails,
  bookSession,
  sendMessage,
  getMentorReviews,
  applyToBecomeMentor,
  getMyMentorStatus,
} = require('../controllers/mentorController');

// Get all mentors
router.get('/', protect, getAllMentors);

// Check user's mentor status
router.get('/my-status', protect, getMyMentorStatus);

// Apply to become a mentor
router.post('/apply', protect, applyToBecomeMentor);

// Get mentor details
router.get('/:id', protect, getMentorDetails);

// Get mentor reviews
router.get('/:id/reviews', getMentorReviews);

// Book a session
router.post('/:id/book', protect, bookSession);

// Send message
router.post('/:id/message', protect, sendMessage);

module.exports = router;
