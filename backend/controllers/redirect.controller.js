// controllers/redirect.controller.js
// Core redirect logic: looks up the short code, records analytics, then redirects.

const Url   = require('../models/Url.model');
const Visit = require('../models/Visit.model');

// ─── GET /:shortCode ──────────────────────────────────────────────────────────
// 1. Find the URL by shortCode OR customAlias
// 2. Check if it has expired
// 3. Record the visit in the visits collection
// 4. Increment click counter
// 5. Redirect the user to the original URL

const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Look up by customAlias first, then by shortCode
    const url = await Url.findOne({
      $or: [
        { shortCode },
        { customAlias: shortCode.toLowerCase() },
      ],
    });

    if (!url) {
      // No match — send a JSON 404 (frontend can catch this)
      return res.status(404).json({
        success: false,
        message: 'Short URL not found.',
      });
    }

    // Check if the link has expired
    if (url.expiryDate && new Date() > url.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'This link has expired.',
        expired: true,
      });
    }

    // ─── Record the visit ───────────────────────────────────────────────────

    // Get visitor's real IP (handles proxies/load balancers)
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    // Save the visit document (fire-and-forget style, but we await to be safe)
    await Visit.create({
      urlId:     url._id,
      timestamp: new Date(),
      ipAddress,
      userAgent,
    });

    // ─── Update URL stats ───────────────────────────────────────────────────

    // Increment clicks and update lastVisited atomically
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      lastVisited: new Date(),
    });

    // ─── Redirect ──────────────────────────────────────────────────────────

    // 302 = temporary redirect (doesn't cache, good for analytics)
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ success: false, message: 'Redirect failed.' });
  }
};

module.exports = { redirect };
