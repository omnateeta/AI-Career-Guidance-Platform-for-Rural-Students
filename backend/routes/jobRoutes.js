const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRealTimeJobs } = require('../controllers/jobController');

// Get real-time jobs with filters
router.get('/', protect, getRealTimeJobs);

// Get hyperlocal jobs
router.get('/hyperlocal', protect, getRealTimeJobs);

// Get trending jobs
router.get('/trending', protect, getRealTimeJobs);

module.exports = router;
