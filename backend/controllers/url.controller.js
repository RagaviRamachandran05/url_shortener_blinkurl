
// src/controllers/auth.controller.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Hex-codes for custom user avatars
const AVATAR_COLORS = ['#F5A623', '#E85D75', '#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

// ─── 1. USER REGISTER CONTROLLER (POST /api/auth/register) ───────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Pick a random avatar theme color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Create user record
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      avatarColor,
      lastLoginAt: new Date(),
      loginCount: 1
    });

    // Generate JWT token matching authorization lifecycle setup
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        avatarInitials: user.avatarInitials
      }
    });

  } catch (err) {
    console.error('Registration controller error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ─── 2. USER LOGIN CONTROLLER (POST /api/auth/login) ──────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Find user record in MongoDB collection
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Verify incoming text string with stored encrypted salt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Track user engagement metrics and statistics on successful authentication
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    // Generate token payload response parameters matching React Context handlers
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        avatarInitials: user.avatarInitials
      }
    });

  } catch (err) {
    console.error('Login controller error:', err);
    return res.status(500).json({ message: 'Server error processing authentication.' });
  }
};

// ─── 3. FORGOT PASSWORD ACTION CONTROLLER (POST /api/auth/forgot-password) ────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Security practice: Don't explicitly reveal if an email doesn't exist
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a unique 20-byte random hex token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token expiration context window for 1 hour from now
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
    await user.save({ validateBeforeSave: false });

    // Set up Nodemailer transporter using backend environment configurations
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Your 16-character Google App Password
      },
    });

    // Create the reset link pointing to the Vite frontend router views
    const frontendUrl = process.env.VITE_API_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'BlinkURL - Password Reset Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #00A3A3;">Password Reset Request</h2>
          <p>You requested a password reset for your BlinkURL account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #00A3A3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 0.85rem; color: #666;">This link will expire in 1 hour. If you didn't request this change, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Reset email sent successfully.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error processing request.' });
  }
};

// ─── 4. RESET PASSWORD SUBMIT ACTION CONTROLLER (POST /api/auth/reset-password/:token) ───
exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params; // Extracted from URL path parameters

  if (!password) {
    return res.status(400).json({ message: 'Please enter a new password.' });
  }

  try {
    // Find user with active token that hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token verification lifecycle check
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash the incoming new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear tracking lifecycle tokens out of the document collection
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Use validateBeforeSave: false to prevent partial schema definition conflicts on save execution
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Password updated successfully! You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error updating password.' });
  }
};