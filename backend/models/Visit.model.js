// models/Visit.model.js
// Each visit/click to a short URL is stored as a Visit document.
// Relationship: Visit → Url (many visits belong to one URL)

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    // Which shortened URL was visited
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true, // For fast analytics queries
    },

    // When the visit happened
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // Visitor's IP address (for analytics, not shown to others)
    ipAddress: {
      type: String,
      default: 'unknown',
    },

    // Browser/device info from the User-Agent header
    userAgent: {
      type: String,
      default: 'unknown',
    },
  },
  {
    // We use our own timestamp field so no need for Mongoose timestamps
    timestamps: false,
  }
);

module.exports = mongoose.model('Visit', visitSchema);
