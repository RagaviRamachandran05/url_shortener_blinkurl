// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/login', form);
      login(data.user, data.token);
      success('Logged in successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to your backend Google OAuth passport route
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>
        
        {/* Header (Removed Thunderbolt and updated Subtitle text) */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sign in to your BlinkURL account
          </p>
        </div>

        {/* Input Card Container */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <form onSubmit={handleSubmit}>
            
            {/* Email field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">EMAIL</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="name@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                disabled={loading}
              />
            </div>

            {/* Password input with forgot password redirect link */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>PASSWORD</label>
                <Link 
                  to="/forgot-password" 
                  style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={form.password}
                  style={{ paddingRight: '2.5rem' }}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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

            {/* Submit traditional fields */}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Minimal visual separator line */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ padding: '0 10px', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Clean Google Single Sign On CTA Button */}
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="btn btn-ghost"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '0.65rem', border: '1px solid var(--border)', 
              background: 'transparent', fontWeight: 600, fontSize: '0.88rem',
              borderRadius: 'var(--radius-md)', cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.77z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 5 12c0-.79.13-1.57.32-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.39l4.11-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.61l4.11 3.15c.94-2.85 3.57-4.96 6.68-4.96z"/>
            </svg>
            Continue with Google
          </button>

        </div>

        {/* Footer (Bcrypt warning section removed completely) */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </div>

      </div>
    </div>
  );
}