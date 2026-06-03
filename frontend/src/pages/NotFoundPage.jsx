// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={styles.page}>
      <div style={styles.code}>404</div>
      <h1 style={styles.title}>Page Not Found</h1>
      <p style={styles.subtitle}>
        This page doesn't exist — or the short link you visited may have expired.
      </p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}

const styles = {
  page: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      'calc(100vh - 60px)',
    textAlign:      'center',
    padding:        '2rem',
  },
  code: {
    fontFamily: 'var(--font-mono)',
    fontSize:   '6rem',
    fontWeight: 700,
    color:      'var(--border-light)',
    lineHeight: 1,
    marginBottom: '1rem',
  },
  title: {
    fontSize:     '1.5rem',
    fontWeight:   700,
    marginBottom: '0.75rem',
  },
  subtitle: {
    color:        'var(--text-muted)',
    fontSize:     '0.9rem',
    maxWidth:     '400px',
    marginBottom: '2rem',
  },
};
