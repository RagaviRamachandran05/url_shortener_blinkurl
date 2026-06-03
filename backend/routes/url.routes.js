// routes/url.routes.js
// All URL management routes are protected — user must be logged in.

const express  = require('express');
const { createUrl, getAllUrls, updateUrl, deleteUrl } = require('../controllers/url.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes below require a valid JWT
router.use(protect);

// POST   /api/url/create  — Create a new short URL
router.post('/create', createUrl);

// GET    /api/url/all     — Get all URLs for the logged-in user
router.get('/all', getAllUrls);

// PUT    /api/url/:id     — Update a URL's destination
router.put('/:id', updateUrl);

// DELETE /api/url/:id     — Delete a URL and its analytics
router.delete('/:id', deleteUrl);

module.exports = router;
