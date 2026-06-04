// server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.VITE_API_URL || '*', credentials: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const urlRoutes       = require('./routes/url.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const profileRoutes   = require('./routes/profile.routes');
const redirectRoute   = require('./routes/redirect.routes');

app.use('/api/auth',      authRoutes);
app.use('/api/url',       urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/',              redirectRoute);  // must be last

app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT       = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ Connected to MongoDB');

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} is already in use. Stop the other backend process and try again.`);
      process.exit(1);
    }

    console.error('❌ Failed to start server:', err.message || err);
    process.exit(1);
  });
}).catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });
