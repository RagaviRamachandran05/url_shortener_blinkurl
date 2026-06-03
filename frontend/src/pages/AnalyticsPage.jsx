// src/pages/AnalyticsPage.jsx
// Full analytics page: total clicks, last visit, recent visits table, daily trend chart.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';
import BarChart from '../components/BarChart';

export default function AnalyticsPage() {
  const { id } = useParams();
  const { error } = useToast();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/api/analytics/${id}`);
        setData(res.data.analytics);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : 'Never';

  const truncate = (str, n = 50) => str?.length > n ? str.slice(0, n) + '...' : str;

  if (loading) {
    return (
      <div className="loading-center" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="spinner" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state page">
        <h3>Analytics not found</h3>
        <p>This link may have been deleted.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Back link */}
        <Link to="/dashboard" style={styles.back}>← Back to Dashboard</Link>

        {/* Page header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Link Analytics</h1>
          <span className="mono" style={{ fontSize: '0.9rem' }}>
            {data.shortUrl?.replace(/^https?:\/\//, '')}
          </span>
        </div>

        {/* Original URL */}
        <div style={styles.originalUrlBox}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
            Destination URL
          </span>
          <a href={data.originalUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', wordBreak: 'break-all', fontSize: '0.9rem' }}>
            {data.originalUrl}
          </a>
        </div>

        {/* Stat cards */}
        <div style={styles.statGrid}>
          <StatCard label="Total Clicks" value={data.totalClicks.toLocaleString()} icon="🖱️" />
          <StatCard label="Last Visit"   value={fmt(data.lastVisited)} icon="🕐" small />
          <StatCard label="Created"      value={fmt(data.createdAt)} icon="📅" small />
          {data.expiryDate && (
            <StatCard
              label="Expires"
              value={fmt(data.expiryDate)}
              icon="⏰"
              small
              highlight={new Date(data.expiryDate) < new Date() ? 'danger' : 'warning'}
            />
          )}
        </div>

        {/* Daily Trend Chart */}
        {data.dailyTrends?.length > 0 ? (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={styles.sectionTitle}>Daily Clicks (Last 30 Days)</h2>
            <BarChart data={data.dailyTrends} />
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No click data in the last 30 days yet.</p>
          </div>
        )}

        {/* Recent Visits Table */}
        <div className="card">
          <h2 style={styles.sectionTitle}>Recent 20 Visits</h2>

          {data.recentVisits?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No visits recorded yet.</p>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Timestamp</th>
                    <th className="hide-mobile">IP Address</th>
                    <th className="hide-mobile">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisits.map((v, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                      <td style={{ fontSize: '0.8rem' }}>{fmt(v.timestamp)}</td>
                      <td className="hide-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {v.ipAddress}
                      </td>
                      <td className="hide-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 260 }}>
                        {truncate(v.userAgent, 60)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Sub-component ──────────────────────────────────────────────────

function StatCard({ label, value, icon, small, highlight }) {
  const color =
    highlight === 'danger'  ? 'var(--danger)'  :
    highlight === 'warning' ? 'var(--warning)' :
    'var(--accent)';

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: small ? '0.85rem' : '1.8rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}

const styles = {
  back: {
    display:      'inline-block',
    color:        'var(--text-muted)',
    fontSize:     '0.875rem',
    marginBottom: '1.5rem',
  },
  header: {
    marginBottom: '1rem',
  },
  title: {
    fontSize:     '1.5rem',
    fontWeight:   700,
    marginBottom: '0.25rem',
  },
  originalUrlBox: {
    background:   'var(--bg-card)',
    border:       '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding:      '0.85rem 1rem',
    marginBottom: '1.5rem',
  },
  statGrid: {
    display:      'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap:          '1rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize:  '1rem',
    fontWeight: 600,
    color:      'var(--text-muted)',
  },
};
