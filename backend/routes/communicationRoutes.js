const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  communicate,
  getProgress,
  getExercises,
  updateLevel,
  processVoice,
} = require('../controllers/communicationController');

// Public route (no authentication required for basic usage)
router.post('/communicate', communicate);

// Authenticated routes
router.post('/voice', protect, processVoice);
router.get('/communicate/progress', protect, getProgress);
router.get('/communicate/exercises', protect, getExercises);
router.post('/communicate/level', protect, updateLevel);

module.exports = router;
