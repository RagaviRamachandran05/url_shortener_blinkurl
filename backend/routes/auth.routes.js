// // routes/auth.routes.js
// const express = require('express');
// const { register, login } = require('../controllers/auth.controller');

// const router = express.Router();

// // POST /api/auth/register
// router.post('/register', register);

// // POST /api/auth/login
// router.post('/login', login);

// module.exports = router;






// // routes/auth.routes.js
// const express = require('express');
// const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// const router = express.Router();

// // POST /api/auth/register
// router.post('/register', register);

// // POST /api/auth/login
// router.post('/login', login);

// // POST /api/auth/forgot-password - Request reset token
// router.post('/forgot-password', forgotPassword);

// // POST /api/auth/reset-password - Verify token and update password
// router.post('/reset-password', resetPassword);

// module.exports = router;













const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { register, login } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'BlinkURL - Password Reset Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your BlinkURL account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #008080; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Reset email sent successfully.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error processing request.' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error updating password.' });
  }
});

module.exports = router;