// routes/profile.routes.js
const express = require('express');
const { getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect); // all profile routes require auth

router.get('/',          getProfile);
router.put('/',          updateProfile);
router.put('/password',  changePassword);
router.delete('/',       deleteAccount);

module.exports = router;
