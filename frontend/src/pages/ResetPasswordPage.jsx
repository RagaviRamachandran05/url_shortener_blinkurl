// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const { token } = useParams(); // Catches the secure token from URL string
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Connect straight to your backend parameter update route
    //   await API.post(`/api/auth/reset-password/${token}`, { password });
    await API.post(`/api/auth/reset-password/${token}`, { password, confirmPassword });
      success('Password reset complete! Please log in.');
      navigate('/login');
    } catch (err) {
      error(err.response?.data?.message || 'Link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Choose New Password
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Please finalize your account identity protection adjustments.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* New Password input */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
                  }}
                >
                  {showPass ? '🙈' : '👀'}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">CONFIRM NEW PASSWORD</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Save and Update Password'}
            </button>
          </form>
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