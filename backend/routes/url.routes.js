
// // routes/url.routes.js
// const express = require('express');
// const { 
//   createUrl, 
//   getAllUrls, 
//   updateUrl, 
//   deleteUrl, 
//   bulkCreate, 
//   getPublicStats 
// } = require('../controllers/url.controller.fixed');
// const { protect } = require('../middleware/auth.middleware');

// const router = express.Router();

// // ─── UNPROTECTED PUBLIC ROUTES ───────────────────────────────────────────────
// // Anyone can view minimal link analytics without logging in


// // ─── JWT PROTECTED PRIVATE ROUTES ────────────────────────────────────────────
// // All routes declared below this line require a valid authorization token header
// router.use(protect);

// // POST   /api/url/create — Create a new short URL
// router.post('/create', createUrl);

// // POST   /api/url/bulk — Bulk-create short URLs
// router.post('/bulk', bulkCreate);

// // GET    /api/url/all — Get all URLs owned by the logged-in user
// router.get('/all', getAllUrls);


// // Your router path looks like this:
// router.get('/stats/:shortCode', getPublicStats);

// // PUT    /api/url/:id — Update a URL's configurations or destination path
// router.put('/:id', updateUrl);

// // DELETE /api/url/:id — Delete a URL alongside its aggregate history metrics
// router.delete('/:id', deleteUrl);

// module.exports = router;









// routes/url.routes.js
const express = require('express');
const { 
  createUrl, 
  getAllUrls, 
  updateUrl, 
  deleteUrl, 
  bulkCreate, 
  getPublicStats 
} = require('../controllers/url.controller.fixed');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ─── UNPROTECTED PUBLIC ROUTES ───────────────────────────────────────────────
// Anyone can view minimal link analytics without logging in.
// Matches path: GET /api/url/stats/:shortCode
router.get('/stats/:shortCode', getPublicStats);


// ─── JWT PROTECTED PRIVATE ROUTES ────────────────────────────────────────────
// All routes declared below this line require a valid authorization token header
router.use(protect);

// POST   /api/url/create — Create a new short URL
router.post('/create', createUrl);

// POST   /api/url/bulk — Bulk-create short URLs
router.post('/bulk', bulkCreate);

// GET    /api/url/all — Get all URLs owned by the logged-in user
router.get('/all', getAllUrls);

// PUT    /api/url/:id — Update a URL's configurations or destination path
router.put('/:id', updateUrl);

// DELETE /api/url/:id — Delete a URL alongside its aggregate history metrics
router.delete('/:id', deleteUrl);

module.exports = router;