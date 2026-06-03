// routes/redirect.routes.js
// Catches /:shortCode and handles the redirect.
// Must be mounted LAST in server.js to avoid catching API paths.

const express  = require('express');
const { redirect } = require('../controllers/redirect.controller');

const router = express.Router();

// GET /:shortCode
router.get('/:shortCode', redirect);

module.exports = router;
