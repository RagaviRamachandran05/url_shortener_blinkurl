// controllers/auth.controller.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');
const { isStrongPassword } = require('../utils/helpers');

const AVATAR_COLORS = ['#F5A623','#E85D75','#6366F1','#10B981','#3B82F6','#F59E0B','#8B5CF6','#EC4899'];

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ success: false, message: 'Invalid email format.' });

    if (!isStrongPassword(password))
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters with a letter and number.' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ success: false, message: 'Email is already registered.' });

    // Pick a random avatar color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({
      name, email, password, avatarColor,
      lastLoginAt: new Date(), loginCount: 1,
    });

    const token = createToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        avatarInitials: user.avatarInitials, avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // Track login stats
    user.lastLoginAt = new Date();
    user.loginCount  = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    const token = createToken(user._id);
    res.json({
      success: true, message: 'Login successful.', token,
      user: {
        id: user._id, name: user.name, email: user.email,
        avatarInitials: user.avatarInitials, avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

module.exports = { register, login };


// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const User = require('../models/user.model'); // Adjust schema location to match your project

// // ... your existing register and login controller exports ...

// // @desc    Request a password reset token
// // @route   POST /api/auth/forgot-password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ message: 'Email address is required.' });
//     }

//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) {
//       return res.status(404).json({ message: 'No account found with that email address.' });
//     }

//     // Generate a secure 6-character verification string
//     const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();

//     // Token expires in 15 minutes
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
//     await user.save();

//     // Log to terminal for easy testing without an email provider configured
//     console.log(`\n======================================================`);
//     console.log(`RESET TOKEN FOR: ${email}`);
//     console.log(`TOKEN: ${resetToken}`);
//     console.log(`======================================================\n`);

//     return res.status(200).json({ message: 'Verification token sent to your email!' });
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     return res.status(500).json({ message: 'Internal server error.' });
//   }
// };

// // @desc    Reset password using verification token
// // @route   POST /api/auth/reset-password
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, token, newPassword } = req.body;

//     if (!email || !token || !newPassword) {
//       return res.status(400).json({ message: 'All verification fields are required.' });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//       resetPasswordToken: token.trim().toUpperCase(),
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Invalid token or token has expired.' });
//     }

//     // Hash and store new password
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     // Clean up temporary reset fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     return res.status(200).json({ message: 'Password recreated successfully!' });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     return res.status(500).json({ message: 'Internal server error.' });
//   }
// };
