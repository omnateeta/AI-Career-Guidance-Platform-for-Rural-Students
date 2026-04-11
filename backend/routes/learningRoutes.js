const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/generate', protect, (req, res) => {
  res.json({ success: true, message: 'Generate learning path' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ success: true, message: 'Get learning path' });
});

router.put('/:id/step/:stepId', protect, (req, res) => {
  res.json({ success: true, message: 'Mark step complete' });
});

module.exports = router;
