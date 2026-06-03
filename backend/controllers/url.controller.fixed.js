// backend/controllers/url.controller.fixed.js
const Url = require('../models/Url.model');
const Visit = require('../models/Visit.model');
const { generateUniqueShortCode, isValidUrl } = require('../utils/helpers');

const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required.' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL (must start with http:// or https://).' });
    }

    let slug = null;
    if (customAlias) {
      const aliasRegex = /^[a-z0-9-]+$/;
      const cleaned = customAlias.trim().toLowerCase();
      if (!aliasRegex.test(cleaned)) {
        return res.status(400).json({ success: false, message: 'Custom alias can only contain lowercase letters, numbers, and hyphens.' });
      }
      if (cleaned.length < 3 || cleaned.length > 30) {
        return res.status(400).json({ success: false, message: 'Custom alias must be 3–30 characters.' });
      }
      const existing = await Url.findOne({ customAlias: cleaned });
      if (existing) {
        return res.status(409).json({ success: false, message: 'This custom alias is already taken. Please choose another.' });
      }
      slug = cleaned;
    }

    const shortCode = await generateUniqueShortCode();
    const urlData = {
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: slug || undefined,
    };

    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (Number.isNaN(expiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date.' });
      }
      if (expiry <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
      }
      urlData.expiryDate = expiry;
    }

    const url = await Url.create(urlData);
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${url.customAlias || url.shortCode}`;

    return res.status(201).json({
      success: true,
      message: 'Short URL created successfully.',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        shortUrl,
        clicks: url.clicks,
        expiryDate: url.expiryDate,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    console.error('Create URL error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create short URL.' });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    const result = urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      customAlias: url.customAlias,
      shortUrl: `${baseUrl}/${url.customAlias || url.shortCode}`,
      clicks: url.clicks,
      lastVisited: url.lastVisited,
      expiryDate: url.expiryDate,
      createdAt: url.createdAt,
    }));

    return res.json({ success: true, count: result.length, urls: result });
  } catch (error) {
    console.error('Get all URLs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch URLs.' });
  }
};

const updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Original URL is required.' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL.' });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or you do not have permission.' });
    }

    url.originalUrl = originalUrl;
    await url.save();

    return res.json({ success: true, message: 'URL updated successfully.', url });
  } catch (error) {
    console.error('Update URL error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update URL.' });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or you do not have permission.' });
    }

    await Url.deleteOne({ _id: url._id });
    await Visit.deleteMany({ urlId: url._id });

    return res.json({ success: true, message: 'URL and its analytics deleted successfully.' });
  } catch (error) {
    console.error('Delete URL error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete URL.' });
  }
};

const bulkCreate = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: 'No URLs provided.' });
    }

    if (urls.length > 100) {
      return res.status(400).json({ success: false, message: 'Maximum 100 URLs per upload.' });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const results = [];

    for (const item of urls) {
      const originalUrl = item.url?.trim();
      const customAlias = item.alias?.trim().toLowerCase() || null;

      if (!originalUrl || !isValidUrl(originalUrl)) {
        results.push({ originalUrl, status: 'failed', reason: 'Invalid URL' });
        continue;
      }

      try {
        if (customAlias) {
          const exists = await Url.findOne({ customAlias });
          if (exists) {
            results.push({ originalUrl, status: 'failed', reason: 'Alias already taken' });
            continue;
          }
        }

        const shortCode = await generateUniqueShortCode();
        await Url.create({
          userId: req.user._id,
          originalUrl,
          shortCode,
          customAlias: customAlias || undefined,
        });

        results.push({
          originalUrl,
          shortUrl: `${baseUrl}/${customAlias || shortCode}`,
          shortCode,
          status: 'success',
        });
      } catch {
        results.push({ originalUrl, status: 'failed', reason: 'Server error' });
      }
    }

    const succeeded = results.filter((r) => r.status === 'success').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return res.status(201).json({
      success: true,
      message: `${succeeded} shortened, ${failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('bulkCreate error:', error);
    return res.status(500).json({ success: false, message: 'Bulk creation failed.' });
  }
};

const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Queries either shortCode or customAlias configurations seamlessly
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).json({ success: false, message: 'Shortened link profile not found.' });
    }

    // Fetch related visits history entries from collection
    const visitHistory = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 });

    // Enclosed inside the 'data' key block to support frontend destruction assignments
    return res.json({
      success: true,
      data: {
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        longUrl: url.originalUrl, // Explicitly mapped for your frontend layouts
        clicks: url.clicks || 0,
        createdAt: url.createdAt,
        analytics: visitHistory || [], // Mapped to analytics key for BarChart compatibility
      },
    });
  } catch (error) {
    console.error('Public stats fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to extract link statistics.' });
  }
};

module.exports = { createUrl, getAllUrls, updateUrl, deleteUrl, bulkCreate, getPublicStats };