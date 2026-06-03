// // // routes/auth.routes.js
// // const express = require('express');
// // const { register, login } = require('../controllers/auth.controller');

// // const router = express.Router();

// // // POST /api/auth/register
// // router.post('/register', register);

// // // POST /api/auth/login
// // router.post('/login', login);

// // module.exports = router;






// // // routes/auth.routes.js
// // const express = require('express');
// // const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// // const router = express.Router();

// // // POST /api/auth/register
// // router.post('/register', register);

// // // POST /api/auth/login
// // router.post('/login', login);

// // // POST /api/auth/forgot-password - Request reset token
// // router.post('/forgot-password', forgotPassword);

// // // POST /api/auth/reset-password - Verify token and update password
// // router.post('/reset-password', resetPassword);

// // module.exports = router;













// const express = require('express');
// const router = express.Router();
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const User = require('../models/User.model');
// const bcrypt = require('bcryptjs');

// // ─── 1. FORGOT PASSWORD ENDPOINT ─────────────────────────────────────────────
// router.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) {
//       // Security practice: Don't explicitly reveal if an email doesn't exist
//       return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
//     }

//     // Generate a unique 20-byte random hex token
//     const resetToken = crypto.randomBytes(20).toString('hex');
    
//     // Set token expiration for 1 hour from now
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
//     await user.save();

//     // Set up Nodemailer transporter using your .env values
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS, // Your 16-character App Password
//       },
//     });

//     // Create the reset link pointing to the Vite frontend router
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

//     const mailOptions = {
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: 'BlinkURL - Password Reset Request',
//       html: `
//         <div style="font-family: sans-serif; padding: 20px; color: #333;">
//           <h2>Password Reset Request</h2>
//           <p>You requested a password reset for your BlinkURL account. Click the button below to set a new password:</p>
//           <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #008080; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">Reset Password</a>
//           <p>This link will expire in 1 hour.</p>
//           <p>If you didn't request this, you can safely ignore this email.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'Reset email sent successfully.' });

//   } catch (err) {
//     console.error('Forgot password error:', err);
//     res.status(500).json({ message: 'Server error processing request.' });
//   }
// });

// // ─── 2. RESET PASSWORD SUBMIT ENDPOINT ────────────────────────────────────────
// router.post('/reset-password/:token', async (req, res) => {
//   const { password } = req.body;
//   const { token } = req.params;

//   try {
//     // Find user with active token that hasn't expired yet
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
//     }

//     // Hash the incoming new password using bcrypt
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     // Clear the tracking token fields completely
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: 'Password updated successfully! You can now log in.' });

//   } catch (err) {
//     console.error('Reset password error:', err);
//     res.status(500).json({ message: 'Server error updating password.' });
//   }
// });

// module.exports = router;



// // src/routes/auth.routes.js
// const express = require('express');
// const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// const router = express.Router();

// // POST /api/auth/register
// router.post('/register', register);

// // POST /api/auth/login
// router.post('/login', login);

// // POST /api/auth/forgot-password
// router.post('/forgot-password', forgotPassword);

// // POST /api/auth/reset-password/:token (Notice the parameter match mapping)
// router.post('/reset-password/:token', resetPassword);

// module.exports = router;



// backend/routes/auth.routes.js
// const express = require('express');
// const router = express.Router();

// // Ensure it points to '../controllers/auth.controller' (ONE level up from the routes folder)
// const { 
//   register, 
//   login, 
//   forgotPassword, 
//   resetPassword 
// } = require('../controllers/auth.controller');

// // Endpoints mapped to handlers
// router.post('/register', register);
// router.post('/login', login);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);

// module.exports = router;


// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

// Step back 1 folder tier safely to access target controller methods map
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;