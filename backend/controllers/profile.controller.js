// // controllers/profile.controller.js
// // Handles GET /api/profile (fetch), PUT /api/profile (update name/email),
// // PUT /api/profile/password (change password), DELETE /api/profile (delete account)

// const User  = require('../models/User.model');
// const Url   = require('../models/Url.model');
// const Visit = require('../models/Visit.model');
// const bcrypt = require('bcryptjs');

// // ── GET /api/profile ─────────────────────────────────────────────────────────
// const getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//     // Count the user's total URLs and total clicks
//     const urls        = await Url.find({ userId: user._id });
//     const totalUrls   = urls.length;
//     const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

//     res.json({
//       success: true,
//       user: {
//         id:               user._id,
//         name:             user.name,
//         email:            user.email,
//         bio:              user.bio,
//         phone:            user.phone,
//         website:          user.website,
//         location:         user.location,
//         avatarInitials:   user.avatarInitials,
//         avatarColor:      user.avatarColor,
//         lastLoginAt:      user.lastLoginAt,
//         loginCount:       user.loginCount,
//         passwordChangedAt: user.passwordChangedAt,
//         createdAt:        user.createdAt,
//         stats: { totalUrls, totalClicks },
//       },
//     });
//   } catch (err) {
//     console.error('getProfile error:', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
//   }
// };

// // ── PUT /api/profile ─────────────────────────────────────────────────────────
// // Update name, email, bio, phone, website, location
// const updateProfile = async (req, res) => {
//   try {
//     const { name, email, bio, phone, website, location } = req.body;
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//     if (name) {
//       if (name.trim().length < 2)
//         return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
//       user.name = name.trim();
//     }

//     if (email && email !== user.email) {
//       if (!/^\S+@\S+\.\S+$/.test(email))
//         return res.status(400).json({ success: false, message: 'Invalid email format.' });
//       const exists = await User.findOne({ email: email.toLowerCase() });
//       if (exists)
//         return res.status(409).json({ success: false, message: 'Email is already in use.' });
//       user.email = email.toLowerCase();
//     }

//     if (bio      !== undefined) user.bio      = bio.slice(0, 200);
//     if (phone    !== undefined) user.phone    = phone.trim();
//     if (website  !== undefined) user.website  = website.trim();
//     if (location !== undefined) user.location = location.trim();

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Profile updated successfully.',
//       user: {
//         id:             user._id,
//         name:           user.name,
//         email:          user.email,
//         bio:            user.bio,
//         phone:          user.phone,
//         website:        user.website,
//         location:       user.location,
//         avatarInitials: user.avatarInitials,
//         avatarColor:    user.avatarColor,
//       },
//     });
//   } catch (err) {
//     console.error('updateProfile error:', err);
//     res.status(500).json({ success: false, message: 'Failed to update profile.' });
//   }
// };

// // ── PUT /api/profile/password ─────────────────────────────────────────────────
// // Requires current password verification before allowing change
// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     if (!currentPassword || !newPassword || !confirmPassword)
//       return res.status(400).json({ success: false, message: 'All password fields are required.' });

//     if (newPassword !== confirmPassword)
//       return res.status(400).json({ success: false, message: 'New passwords do not match.' });

//     if (newPassword.length < 8)
//       return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });

//     if (!/[A-Z]/.test(newPassword))
//       return res.status(400).json({ success: false, message: 'New password must contain an uppercase letter.' });

//     if (!/[0-9]/.test(newPassword))
//       return res.status(400).json({ success: false, message: 'New password must contain a number.' });

//     if (!/[^A-Za-z0-9]/.test(newPassword))
//       return res.status(400).json({ success: false, message: 'New password must contain a special character.' });

//     // Verify current password
//     const user = await User.findById(req.user._id).select('+password');
//     if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch)
//       return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

//     if (currentPassword === newPassword)
//       return res.status(400).json({ success: false, message: 'New password must be different from current password.' });

//     // The pre-save hook in User.model.js will hash the new password
//     user.password = newPassword;
//     await user.save();

//     res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
//   } catch (err) {
//     console.error('changePassword error:', err);
//     res.status(500).json({ success: false, message: 'Failed to change password.' });
//   }
// };

// // ── DELETE /api/profile ───────────────────────────────────────────────────────
// // Permanently deletes user + all their URLs and visits
// const deleteAccount = async (req, res) => {
//   try {
//     const { password } = req.body;
//     if (!password)
//       return res.status(400).json({ success: false, message: 'Password is required to delete account.' });

//     const user = await User.findById(req.user._id).select('+password');
//     if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch)
//       return res.status(401).json({ success: false, message: 'Incorrect password.' });

//     // Delete all user's URL visits first
//     const urls = await Url.find({ userId: user._id });
//     for (const url of urls) {
//       await Visit.deleteMany({ urlId: url._id });
//     }
//     // Delete all URLs
//     await Url.deleteMany({ userId: user._id });
//     // Delete user
//     await User.deleteOne({ _id: user._id });

//     res.json({ success: true, message: 'Account permanently deleted.' });
//   } catch (err) {
//     console.error('deleteAccount error:', err);
//     res.status(500).json({ success: false, message: 'Failed to delete account.' });
//   }
// };

// module.exports = { getProfile, updateProfile, changePassword, deleteAccount };




// controllers/profile.controller.js
const User = require('../models/User.model');
const Url  = require('../models/Url.model');
const Visit = require('../models/Visit.model');

// ── GET /api/profile ─────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
    });
  } catch (err) {
    console.error('getProfile minimal error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch minimal identity structure.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password is required to delete account.' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password.' });

    const urls = await Url.find({ userId: user._id });
    for (const url of urls) {
      await Visit.deleteMany({ urlId: url._id });
    }
    await Url.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};

// ── PUT /api/profile ─────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (name) {
      if (name.trim().length < 2)
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
      user.name = name.trim();
    }

    if (email && email !== user.email) {
      if (!/^\S+@\S+\.\S+$/.test(email))
        return res.status(400).json({ success: false, message: 'Invalid email structure format.' });
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists)
        return res.status(409).json({ success: false, message: 'Email address already active on another account.' });
      user.email = email.toLowerCase();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('updateProfile minimal error:', err);
    res.status(500).json({ success: false, message: 'Failed to rewrite profile data.' });
  }
};