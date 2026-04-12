const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllScholarships,
  getGovernmentScholarships,
  getPrivateScholarships,
  getMatchedScholarships,
  getScholarshipDetails,
  refreshScholarships,
} = require('../controllers/scholarshipController');

// Public routes - no auth required for browsing
router.get('/', getAllScholarships);
router.get('/government', getGovernmentScholarships);
router.get('/private', getPrivateScholarships);

// Protected routes - require authentication
router.use(protect);
router.get('/match', getMatchedScholarships);
router.post('/refresh', refreshScholarships);
router.get('/:id', getScholarshipDetails);

module.exports = router;
