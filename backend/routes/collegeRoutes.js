const express = require('express');
const router = express.Router();
const { getNearbyColleges, refreshCache, getCollegesByCity } = require('../controllers/collegeController');

// Public routes - no authentication required
router.get('/nearby', getNearbyColleges);
router.get('/by-city', getCollegesByCity);
router.post('/refresh-cache', refreshCache);

module.exports = router;
