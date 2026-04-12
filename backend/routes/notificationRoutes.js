const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');

// GET /api/notifications - Get real-time aggregated notifications
router.get('/', getNotifications);

module.exports = router;
