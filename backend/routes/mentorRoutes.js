const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Find mentors' });
});

router.post('/match', protect, (req, res) => {
  res.json({ success: true, message: 'Get mentor matches' });
});

router.post('/request', protect, (req, res) => {
  res.json({ success: true, message: 'Request mentorship' });
});

module.exports = router;
