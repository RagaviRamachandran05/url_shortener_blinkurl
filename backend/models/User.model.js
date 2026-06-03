// models/User.model.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, 'Name is required'],
      trim: true, minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // ── Profile fields ──────────────────────────────────────────────────────
    bio: {
      type: String, default: '', maxlength: [200, 'Bio max 200 characters'], trim: true,
    },
    phone: {
      type: String, default: '', trim: true,
    },
    website: {
      type: String, default: '', trim: true,
    },
    location: {
      type: String, default: '', trim: true,
    },
    avatarInitials: {
      type: String, default: '',   // e.g. "JD" derived from name
    },
    avatarColor: {
      type: String, default: '#F5A623',  // random accent color per user
    },

    // ── Security tracking ───────────────────────────────────────────────────
    lastLoginAt: {
      type: Date, default: null,
    },
    loginCount: {
      type: Number, default: 0,
    },
    passwordChangedAt: {
      type: Date, default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    avatarGender: {
  type: String,
  enum: ['male', 'female'],
  default: 'male'
},
  },
  { timestamps: true }
);

// Hash password on save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// Auto-generate initials from name
userSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    const parts = this.name.trim().split(' ');
    this.avatarInitials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : this.name.slice(0, 2).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
