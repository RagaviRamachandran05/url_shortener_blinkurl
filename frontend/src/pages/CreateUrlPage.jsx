// src/pages/CreateUrlPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';
import QRCode from '../components/QRCode';

export default function CreateUrlPage() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    originalUrl:  '',
    customAlias:  '',
    expiryDate:   '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null); // Holds the result after creation

  const validate = () => {
    const errs = {};

    if (!form.originalUrl.trim()) {
      errs.originalUrl = 'URL is required';
    } else {
      const val = form.originalUrl.trim();

      // Must not have spaces
      if (/\s/.test(val)) {
        errs.originalUrl = 'URL must not contain spaces';
      } else if (!/^https?:\/\//i.test(val)) {
        errs.originalUrl = 'URL must start with http:// or https://';
      } else {
        try {
          const u = new URL(val);
          const hostname = u.hostname;

          if (!hostname || !hostname.includes('.')) {
            errs.originalUrl = 'URL must have a valid domain (e.g. example.com)';
          } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
            errs.originalUrl = 'IP address URLs are not allowed';
          } else {
            const parts = hostname.split('.');
            const tld = parts[parts.length - 1];
            if (tld.length < 2) {
              errs.originalUrl = 'URL must have a valid domain extension (e.g. .com, .org)';
            }
          }
        } catch {
          errs.originalUrl = 'Please enter a valid URL (e.g. https://example.com)';
        }
      }
    }
    if (form.customAlias && !/^[a-z0-9-]+$/.test(form.customAlias)) {
      errs.customAlias = 'Only lowercase letters, numbers, and hyphens allowed';
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.expiryDate)  payload.expiryDate  = form.expiryDate;

      const { data } = await API.post('/api/url/create', payload);
      setCreated(data.url);
      success('Short URL created!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create URL.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => success('Copied to clipboard!'));
  };

  // ─── Success State ──────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Your link is ready!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Share this short URL with anyone
            </p>

            {/* Short URL display */}
            <div style={styles.shortUrlBox}>
              <span className="mono" style={{ fontSize: '1rem' }}>{created.shortUrl}</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(created.shortUrl)}
              >
                Copy
              </button>
            </div>

            {/* Original URL */}
            <p style={styles.originalUrl}>
              <span style={{ color: 'var(--text-muted)' }}>→ </span>
              {created.originalUrl.length > 60
                ? created.originalUrl.slice(0, 60) + '...'
                : created.originalUrl}
            </p>

            {/* QR Code */}
            <div style={{ margin: '1.5rem 0' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>QR Code</p>
              <QRCode value={created.shortUrl} size={160} />
            </div>

            {created.expiryDate && (
              <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                ⚠ Expires: {new Date(created.expiryDate).toLocaleDateString()}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={() => setCreated(null)}>
                Create Another
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={styles.pageTitle}>Create Short URL</h1>
        <p style={styles.pageSubtitle}>Paste a long URL and get a clean short link instantly</p>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Original URL */}
            <div className="form-group">
              <label className="form-label">Long URL *</label>
              <input
                className="form-input"
                type="text"
                name="originalUrl"
                placeholder="https://example.com/very/long/url..."
                value={form.originalUrl}
                onChange={handleChange}
              />
              {errors.originalUrl && <span className="form-error">{errors.originalUrl}</span>}
            </div>

            {/* Custom Alias */}
            <div className="form-group">
              <label className="form-label">Custom Alias <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
              <div style={styles.aliasWrapper}>
                <span style={styles.aliasPrefix}>linksnap.app/</span>
                <input
                  className="form-input"
                  type="text"
                  name="customAlias"
                  placeholder="my-project"
                  value={form.customAlias}
                  onChange={handleChange}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1 }}
                />
              </div>
              {errors.customAlias && <span className="form-error">{errors.customAlias}</span>}
            </div>

            {/* Expiry Date */}
            <div className="form-group">
              <label className="form-label">Expiry Date <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
              <input
                className="form-input"
                type="datetime-local"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</>
                : '⚡ Shorten URL'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize:     '1.5rem',
    fontWeight:   700,
    marginBottom: '0.4rem',
  },
  pageSubtitle: {
    color:        'var(--text-muted)',
    fontSize:     '0.9rem',
    marginBottom: '1.5rem',
  },
  shortUrlBox: {
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'space-between',
    gap:          '1rem',
    background:   'var(--bg)',
    border:       '1px solid var(--accent)',
    borderRadius: 'var(--radius)',
    padding:      '0.75rem 1rem',
    marginBottom: '0.75rem',
  },
  originalUrl: {
    fontSize:     '0.8rem',
    color:        'var(--text-dim)',
    marginBottom: '0.5rem',
    wordBreak:    'break-all',
  },
  aliasWrapper: {
    display:    'flex',
    alignItems: 'stretch',
  },
  aliasPrefix: {
    display:        'flex',
    alignItems:     'center',
    padding:        '0 0.75rem',
    background:     'var(--bg-hover)',
    border:         '1px solid var(--border)',
    borderRight:    'none',
    borderRadius:   'var(--radius) 0 0 var(--radius)',
    fontSize:       '0.8rem',
    color:          'var(--text-muted)',
    whiteSpace:     'nowrap',
  },
};
