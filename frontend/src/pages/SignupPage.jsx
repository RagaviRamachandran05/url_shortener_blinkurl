import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/* Password strength scorer */
function scorePassword(p) {
  let s = 0;
  if (p.length >= 8)  s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

const STRENGTH = [
  { label: 'Too weak',  color: '#EF4444' },
  { label: 'Weak',      color: '#F97316' },
  { label: 'Fair',      color: '#EAB308' },
  { label: 'Strong',    color: '#22C55E' },
  { label: 'Very strong', color: '#10B981' },
];

export default function SignupPage() {
  const { login }           = useAuth();
  const { success, error }  = useToast();
  const navigate            = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [registered, setRegistered] = useState(false);

  const score = scorePassword(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name = 'Name is required';
    if (!form.email)        e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 8)  e.password = 'At least 8 characters required';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must include a number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/register', {
        name: form.name, email: form.email, password: form.password,
      });
      setRegistered(true);
      setTimeout(() => {
        login(data.user, data.token);
        success('Welcome, ' + data.user.name + '! Your account is secured.');
        navigate('/dashboard');
      }, 1800);
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '.5rem' }}>
              Account secured!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
              Your password is hashed with bcrypt (12 rounds). Redirecting to dashboard...
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '.82rem', textAlign: 'left' }}>
              {['✅ Password hashed with bcrypt (12 salt rounds)', '✅ JWT token issued — expires in 7 days', '✅ All routes protected — others cannot see your links', '✅ HTTPS enforced in production'].map(t => (
                <div key={t} className="security-badge">{t}</div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-icon">⚡</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start shortening URLs — free forever</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" type="text" placeholder="Your name"
              value={form.name} onChange={handleChange('name')} autoComplete="name" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange('email')} autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase + number"
                value={form.password} onChange={handleChange('password')}
                autoComplete="new-password"
                style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '1rem' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength meter */}
            {form.password && (
              <>
                <div className="strength-bar-wrap">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="strength-seg"
                      style={{ background: i < score ? STRENGTH[score].color : 'var(--border)' }} />
                  ))}
                </div>
                <div className="strength-label" style={{ color: STRENGTH[score].color }}>
                  {STRENGTH[score].label}
                </div>
              </>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input className="form-input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={handleChange('confirm')} autoComplete="new-password" />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <div className="security-badge" style={{ marginBottom: '1rem' }}>
            🔒 Password is hashed with bcrypt before storage — never stored in plaintext
          </div>

          <button type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</>
              : 'Create Secure Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
