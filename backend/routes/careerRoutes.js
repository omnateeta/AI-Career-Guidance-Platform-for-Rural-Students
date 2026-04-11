const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generatePaths,
  expandNode,
  getCareerDetails,
  getExplorationHistory,
  getTrendingCareers,
} = require('../controllers/careerPathController');

// AI-powered career path generation routes
router.post('/generate-paths', protect, generatePaths);
router.post('/expand-node/:nodeId', protect, expandNode);
router.get('/career-details/:nodeId', protect, getCareerDetails);
router.get('/exploration-history', protect, getExplorationHistory);
router.get('/trending', protect, getTrendingCareers);

// Legacy routes (keep for backward compatibility)
router.post('/recommend', protect, (req, res) => {
  res.json({ success: true, message: 'Get career recommendations from AI' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ success: true, message: 'Get career details' });
});

module.exports = router;
