// utils/helpers.js
// Shared utility functions used across the backend.

const Url = require('../models/Url.model');

// ─── Short Code Generator ──────────────────────────────────────────────────────
// Generates a random alphanumeric string of `length` characters.
// Example output: "aB12xY"

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateShortCode = (length = 6) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return code;
};

// ─── Unique Short Code ─────────────────────────────────────────────────────────
// Generates a short code and checks MongoDB for collisions.
// Keeps trying until it finds one that doesn't exist.

const generateUniqueShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = generateShortCode(6);
    // Check if this code already exists in the database
    const found = await Url.findOne({ shortCode: code });
    exists = !!found;
  }

  return code;
};

// ─── URL Validator ────────────────────────────────────────────────────────────
// Returns true only for proper, real-world http/https URLs.
// Rejects: missing protocol, no domain, no TLD, spaces, localhost-only, etc.

const isValidUrl = (str) => {
  if (!str || typeof str !== 'string') return false;

  // Must not contain spaces
  if (/\s/.test(str)) return false;

  try {
    const url = new URL(str);

    // Must be http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const hostname = url.hostname;

    // Hostname must exist
    if (!hostname) return false;

    // Must have at least one dot (rules out bare names like "http://test")
    if (!hostname.includes('.')) return false;

    // Must not be an IP address (basic check — disallow raw IPs like http://192.168.1.1)
    // Allow if you want IP support, but for a public shortener this is safer
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) return false;

    // TLD must be at least 2 characters (e.g. .io, .com, .co.uk)
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    if (tld.length < 2) return false;

    // Hostname parts must only contain valid characters
    const validHostname = /^[a-zA-Z0-9.-]+$/.test(hostname);
    if (!validHostname) return false;

    return true;
  } catch {
    return false;
  }
};

// ─── Password Strength Checker ────────────────────────────────────────────────
// Returns true if password has at least 6 chars, one letter, one number.

const isStrongPassword = (password) => {
  // At least 6 characters, contains a letter and a number
  return (
    password.length >= 6 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '').replace(/\/api$/, '');
};

const getBaseUrl = (req) => {
  const configuredBaseUrl = normalizeBaseUrl(
    process.env.BASE_URL ||
    process.env.PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.NGROK_URL
  );

  if (configuredBaseUrl) {
    // Prefer the configured production URL, but ignore localhost-style values
    // when the request is coming from a deployed host.
    if (!/localhost:\d+|127\.0\.0\.1:\d+/.test(configuredBaseUrl)) {
      return configuredBaseUrl;
    }
  }

  const forwardedProto =
    req.headers['x-forwarded-proto']?.split(',')[0] ||
    req.protocol ||
    'https';

  const forwardedHost =
    req.headers['x-forwarded-host']?.split(',')[0] ||
    req.get('host') ||
    'url-shortener-blinkurl.onrender.com';

  return normalizeBaseUrl(`${forwardedProto}://${forwardedHost}`);
};

module.exports = {
  generateShortCode,
  generateUniqueShortCode,
  isValidUrl,
  isStrongPassword,
  getBaseUrl,
};
