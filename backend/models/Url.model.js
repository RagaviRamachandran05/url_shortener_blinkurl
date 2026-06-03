// models/Url.model.js
// Schema for shortened URLs. Each URL belongs to a User (userId reference).

const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    // The user who created this shortened URL
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for fast lookup of a user's URLs
    },

    // The original long URL provided by the user
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },

    // The randomly generated 6-character code (e.g., "aB12xY")
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for fast redirect lookups
    },

    // Optional custom alias (e.g., "myportfolio")
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values (only unique when set)
      trim: true,
      lowercase: true,
    },

    // Total number of clicks/visits
    clicks: {
      type: Number,
      default: 0,
    },

    // Timestamp of the last visit
    lastVisited: {
      type: Date,
      default: null,
    },

    // Optional expiry date — expired links show "Link Expired"
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
  }
);

// Virtual: the "slug" used in the short URL (alias takes priority over shortCode)
urlSchema.virtual('slug').get(function () {
  return this.customAlias || this.shortCode;
});

module.exports = mongoose.model('Url', urlSchema);
