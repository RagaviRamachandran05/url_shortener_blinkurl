// controllers/url.controller.js
// Handles creating, listing, updating, and deleting shortened URLs.

const Url   = require('../models/Url.model');
const Visit = require('../models/Visit.model');
const { generateUniqueShortCode, isValidUrl } = require('../utils/helpers');

// ─── POST /api/url/create ─────────────────────────────────────────────────────
// Creates a new shortened URL for the logged-in user.
// Body: { originalUrl, customAlias?, expiryDate? }

const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required.' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL (must start with http:// or https://).' });
    }

    // Handle custom alias
    let slug = null;
    if (customAlias) {
      // Only allow alphanumeric and hyphens
      const aliasRegex = /^[a-z0-9-]+$/;
      const cleaned = customAlias.trim().toLowerCase();
      if (!aliasRegex.test(cleaned)) {
        return res.status(400).json({ success: false, message: 'Custom alias can only contain lowercase letters, numbers, and hyphens.' });
      }
      if (cleaned.length < 3 || cleaned.length > 30) {
        return res.status(400).json({ success: false, message: 'Custom alias must be 3–30 characters.' });
      }
      // Check if alias is already taken
      const existing = await Url.findOne({ customAlias: cleaned });
      if (existing) {
        return res.status(409).json({ success: false, message: 'This custom alias is already taken. Please choose another.' });
      }
      slug = cleaned;
    }

    // Generate unique short code
    const shortCode = await generateUniqueShortCode();

    // Build URL document
    const urlData = {
      userId:      req.user._id,
      originalUrl,
      shortCode,
      customAlias: slug || undefined,
    };

    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (isNaN(expiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date.' });
      }
      if (expiry <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
      }
      urlData.expiryDate = expiry;
    }

    const url = await Url.create(urlData);

    // Build the full short URL to return to the client
    const baseUrl  = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${url.customAlias || url.shortCode}`;

    res.status(201).json({
      success: true,
      message: 'Short URL created successfully.',
      url: {
        id:          url._id,
        originalUrl: url.originalUrl,
        shortCode:   url.shortCode,
        customAlias: url.customAlias,
        shortUrl,
        clicks:      url.clicks,
        expiryDate:  url.expiryDate,
        createdAt:   url.createdAt,
      },
    });
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({ success: false, message: 'Failed to create short URL.' });
  }
};

// ─── GET /api/url/all ─────────────────────────────────────────────────────────
// Returns all URLs created by the logged-in user (newest first).

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Add the full short URL to each result
    const result = urls.map((url) => ({
      id:          url._id,
      originalUrl: url.originalUrl,
      shortCode:   url.shortCode,
      customAlias: url.customAlias,
      shortUrl:    `${baseUrl}/${url.customAlias || url.shortCode}`,
      clicks:      url.clicks,
      lastVisited: url.lastVisited,
      expiryDate:  url.expiryDate,
      createdAt:   url.createdAt,
    }));

    res.json({ success: true, count: result.length, urls: result });
  } catch (error) {
    console.error('Get all URLs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch URLs.' });
  }
};

// ─── PUT /api/url/:id ─────────────────────────────────────────────────────────
// Updates the destination URL of an existing short link.
// Body: { originalUrl }

const updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required.' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL.' });
    }

    // Find the URL and make sure it belongs to this user
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or you do not have permission.' });
    }

    url.originalUrl = originalUrl;
    await url.save();

    res.json({ success: true, message: 'URL updated successfully.', url });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ success: false, message: 'Failed to update URL.' });
  }
};

// ─── DELETE /api/url/:id ──────────────────────────────────────────────────────
// Deletes a short URL and all its visit analytics.

const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or you do not have permission.' });
    }

    // Delete the URL document
    await Url.deleteOne({ _id: url._id });

    // Also delete all associated visit records
    await Visit.deleteMany({ urlId: url._id });

    res.json({ success: true, message: 'URL and its analytics deleted successfully.' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete URL.' });
  }
};

module.exports = { createUrl, getAllUrls, updateUrl, deleteUrl };
