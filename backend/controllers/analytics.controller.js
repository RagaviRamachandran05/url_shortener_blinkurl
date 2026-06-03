// controllers/analytics.controller.js
// Returns detailed analytics for a specific short URL.

const Url   = require('../models/Url.model');
const Visit = require('../models/Visit.model');

// ─── GET /api/analytics/:id ───────────────────────────────────────────────────
// Returns full analytics for a URL owned by the logged-in user.
// Includes: total clicks, last visit, recent 20 visits, daily trends.

const getAnalytics = async (req, res) => {
  try {
    // Find URL and verify ownership
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or access denied.' });
    }

    // Fetch the most recent 20 visits (newest first)
    const recentVisits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('timestamp ipAddress userAgent -_id');

    // ─── Daily Click Trends ────────────────────────────────────────────────
    // Group visits by date for the last 30 days

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await Visit.aggregate([
      {
        // Only visits to this URL, within the last 30 days
        $match: {
          urlId:     url._id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        // Group by calendar date (YYYY-MM-DD)
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          clicks: { $sum: 1 },
        },
      },
      {
        // Sort chronologically
        $sort: { _id: 1 },
      },
      {
        // Rename _id to date for cleaner API output
        $project: {
          _id:    0,
          date:   '$_id',
          clicks: 1,
        },
      },
    ]);

    const baseUrl  = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${url.customAlias || url.shortCode}`;

    res.json({
      success: true,
      analytics: {
        urlId:        url._id,
        originalUrl:  url.originalUrl,
        shortUrl,
        shortCode:    url.shortCode,
        customAlias:  url.customAlias,
        totalClicks:  url.clicks,
        lastVisited:  url.lastVisited,
        createdAt:    url.createdAt,
        expiryDate:   url.expiryDate,
        recentVisits,
        dailyTrends,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};

// ─── GET /api/analytics/:id/public ───────────────────────────────────────────
// Public read-only stats — no auth required. Hides IP addresses.

const getPublicAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    const baseUrl  = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${url.customAlias || url.shortCode}`;

    res.json({
      success: true,
      analytics: {
        shortUrl,
        totalClicks: url.clicks,
        lastVisited: url.lastVisited,
        createdAt:   url.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch public analytics.' });
  }
};

module.exports = { getAnalytics, getPublicAnalytics };
