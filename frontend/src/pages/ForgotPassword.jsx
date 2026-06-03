// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // Connects to your backend route handling password resets
      await API.post('/api/auth/forgot-password', { email });
      success('Reset instructions sent directly to your inbox.');
      setSubmitted(true);
    } catch (err) {
      error(err.response?.data?.message || 'Something went wrong. Please check your spelling.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            We will send you a secure link to reclaim your account.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">EMAIL ADDRESS</label>
                <input 
                  className="form-input" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📩</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Check your inbox</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                If an account exists for <strong>{email}</strong>, verification details will arrive shortly.
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            ⬅ Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}