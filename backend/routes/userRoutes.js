const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Other user routes
router.get('/dashboard', protect, (req, res) => {
  res.json({ success: true, message: 'Get dashboard data' });
});

router.get('/gamification', protect, (req, res) => {
  res.json({ success: true, message: 'Get gamification data' });
});

module.exports = router;
