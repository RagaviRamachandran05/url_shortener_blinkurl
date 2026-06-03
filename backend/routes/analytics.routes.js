// routes/analytics.routes.js
const express = require('express');
const { getAnalytics, getPublicAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/analytics/:id         — Private analytics (requires auth)
router.get('/:id', protect, getAnalytics);

// GET /api/analytics/:id/public  — Public read-only stats
router.get('/:id/public', getPublicAnalytics);

module.exports = router;
