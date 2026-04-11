const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/recommend', protect, (req, res) => {
  res.json({ success: true, message: 'Get career recommendations from AI' });
});

router.get('/trending', protect, (req, res) => {
  res.json({ success: true, message: 'Get trending careers' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ success: true, message: 'Get career details' });
});

module.exports = router;
