// src/components/EditUrlModal.jsx
// Modal dialog for editing a URL's destination.

import React, { useState } from 'react';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function EditUrlModal({ url, onClose, onSave }) {
  const { success, error } = useToast();
  const [newUrl,   setNewUrl]   = useState(url.originalUrl);
  const [loading,  setLoading]  = useState(false);
  const [inputErr, setInputErr] = useState('');

  const handleSave = async () => {
    // Validate
    try {
      const u = new URL(newUrl);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
    } catch {
      setInputErr('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.put(`/api/url/${url.id}`, { originalUrl: newUrl });
      success('URL updated successfully!');
      onSave({ ...url, originalUrl: newUrl });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div style={styles.backdrop} onClick={onClose}>
      {/* Modal */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Edit Destination URL</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p style={styles.subtitle}>
          Short URL: <span className="mono">{url.shortUrl?.replace(/^https?:\/\//, '')}</span>
        </p>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">New Destination URL</label>
          <input
            className="form-input"
            type="url"
            value={newUrl}
            onChange={(e) => { setNewUrl(e.target.value); setInputErr(''); }}
            placeholder="https://..."
            autoFocus
          />
          {inputErr && <span className="form-error">{inputErr}</span>}
        </div>

        <div style={styles.actions}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position:       'fixed',
    inset:          0,
    background:     'rgba(0,0,0,0.7)',
    display:        'flex',
    justifyContent: 'center',
    alignItems:     'center',
    zIndex:         200,
    padding:        '1rem',
  },
  modal: {
    background:   'var(--bg-card)',
    border:       '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding:      '1.75rem',
    width:        '100%',
    maxWidth:     '480px',
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '0.5rem',
  },
  title: {
    fontSize:  '1.1rem',
    fontWeight: 700,
  },
  closeBtn: {
    background: 'none',
    border:     'none',
    color:      'var(--text-muted)',
    fontSize:   '1.1rem',
    cursor:     'pointer',
    padding:    '0.2rem',
  },
  subtitle: {
    fontSize: '0.8rem',
    color:    'var(--text-muted)',
  },
  actions: {
    display:        'flex',
    justifyContent: 'flex-end',
    gap:            '0.75rem',
    marginTop:      '1rem',
  },
};
