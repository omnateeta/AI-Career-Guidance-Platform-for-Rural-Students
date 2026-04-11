const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, (req, res) => {
  res.json({ success: true, message: 'Analyze skill gaps' });
});

router.get('/progress', protect, (req, res) => {
  res.json({ success: true, message: 'Get skill progress' });
});

router.put('/update', protect, (req, res) => {
  res.json({ success: true, message: 'Update skills' });
});

module.exports = router;
