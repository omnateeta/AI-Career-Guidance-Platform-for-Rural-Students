const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getExams,
  getExamDetails,
  getExamsByCategory,
  getRecommendedExams,
  saveExam,
  unsaveExam,
  getSavedExams,
  getLatestUpdates,
  getUpcomingDeadlines,
} = require('../controllers/examController');

// Public routes
router.get('/all', getExams);
router.get('/category/:type', getExamsByCategory);
router.get('/updates', getLatestUpdates);
router.get('/upcoming', getUpcomingDeadlines);
router.get('/:examId', getExamDetails);

// Protected routes (require authentication)
router.post('/recommend', protect, getRecommendedExams);
router.post('/:examId/save', protect, saveExam);
router.delete('/:examId/save', protect, unsaveExam);
router.get('/saved', protect, getSavedExams);

module.exports = router;
