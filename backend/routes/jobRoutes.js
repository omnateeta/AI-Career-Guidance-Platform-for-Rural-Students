const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrivateJobs,
  getGovernmentJobs,
  getAllJobs,
  getNearbyJobs,
  subscribeToAlerts,
  getAlertPreferences,
  unsubscribeFromAlerts,
  getTrendingJobs,
} = require('../controllers/jobController');

// Public routes (no authentication required)
router.get('/private', getPrivateJobs);
router.get('/government', getGovernmentJobs);
router.get('/all', getAllJobs); // Public endpoint for all jobs
router.get('/trending', getTrendingJobs);

// Authenticated routes
router.get('/', protect, getAllJobs);
router.get('/nearby', protect, getNearbyJobs);
router.post('/subscribe', protect, subscribeToAlerts);
router.get('/alerts/preferences', protect, getAlertPreferences);
router.delete('/alerts/unsubscribe', protect, unsubscribeFromAlerts);

module.exports = router;
