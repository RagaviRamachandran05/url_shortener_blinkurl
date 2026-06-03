// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/* ── Password strength utility ───────────────────────────────────────────── */
function scorePassword(p) {
  let s = 0;
  if (p.length >= 8)  s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}
const STRENGTH_LABELS = ['Too weak','Weak','Fair','Strong','Very strong'];
const STRENGTH_COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#10B981'];

function StrengthMeter({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            height: '3px', flex: 1, borderRadius: '99px',
            background: i < score ? STRENGTH_COLORS[score] : 'var(--border)',
            transition: 'background .3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', marginTop: '4px', color: STRENGTH_COLORS[score], fontWeight: 600 }}>
        {STRENGTH_LABELS[score]}
      </div>
    </div>
  );
}

/* ── Section card wrapper ─────────────────────────────────────────────────── */
function Section({ title, icon, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      marginBottom: '1.25rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Main ProfilePage ─────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { updateUser, logout } = useAuth();
  const { success, error }     = useToast();
  const navigate               = useNavigate();

  const [loading, setLoading] = useState(true);

  // Core information form
  const [infoForm, setInfoForm] = useState({ name: '', email: '' });
  const [infoSaving, setInfoSaving] = useState(false);

  // Password form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleting, setDeleting]     = useState(false);

  // Load basic profile info
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/api/profile');
        setInfoForm({
          name:  data.user.name  || '',
          email: data.user.email || '',
        });
      } catch {
        error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [error]);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    if (!infoForm.name.trim() || !infoForm.email.trim()) {
      error('Name and Email are required.');
      return;
    }

    setInfoSaving(true);
    try {
      const { data } = await API.put('/api/profile', infoForm);
      updateUser(data.user); 
      success('Profile updated successfully!');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setInfoSaving(false);
    }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      error('All password fields are required.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setPassSaving(true);
    try {
      await API.put('/api/profile/password', passForm);
      success('Password updated! Please log in again.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePass) { error('Enter your password to confirm account deletion.'); return; }
    setDeleting(true);
    try {
      await API.delete('/api/profile', { data: { password: deletePass } });
      success('Account deleted successfully.');
      logout();
      navigate('/signup');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="loading-center" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="spinner" /><span>Loading Minimal Layout...</span>
    </div>
  );

  return (
    <div className="page" style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '600px' }}>

        {/* Core Profile Area */}
        <Section title="Account Identity" icon="👤">
          <form onSubmit={handleInfoSave}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">FULL NAME *</label>
              <input className="form-input" type="text"
                value={infoForm.name}
                onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">EMAIL ADDRESS *</label>
              <input className="form-input" type="email"
                value={infoForm.email}
                onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={infoSaving}>
                {infoSaving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </Section>

        {/* Security / Password Updates */}
        <Section title="Change Password" icon="🔐">
          <form onSubmit={handlePassSave}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showCurrent ? 'text' : 'password'}
                  value={passForm.currentPassword}
                  style={{ paddingRight: '2.5rem' }}
                  onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} />
                <EyeBtn show={showCurrent} toggle={() => setShowCurrent(!showCurrent)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showNew ? 'text' : 'password'}
                  value={passForm.newPassword}
                  style={{ paddingRight: '2.5rem' }}
                  onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} />
                <EyeBtn show={showNew} toggle={() => setShowNew(!showNew)} />
              </div>
              <StrengthMeter password={passForm.newPassword} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showConfirm ? 'text' : 'password'}
                  value={passForm.confirmPassword}
                  style={{ paddingRight: '2.5rem' }}
                  onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={passSaving}>
                {passSaving ? 'Updating...' : '🔑 Change Password'}
              </button>
            </div>
          </form>
        </Section>

        {/* Danger Zone */}
        <div style={{
          background: 'rgba(248,113,113,0.03)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--negative)', fontSize: '0.95rem', fontWeight: 700 }}>Remove Account</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Permanently erase profile data.</p>
          </div>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>🗑️ Delete</button>
        </div>

        {/* Delete Account Modal Confirmation */}
        {showDelete && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400
          }} onClick={() => setShowDelete(false)}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '2rem', width: '90%', maxWidth: '400px'
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--negative)', marginTop: 0 }}>Confirm Account Deletion</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Please input your password below to confirm deletion.</p>
              <input className="form-input" type="password" placeholder="Verify password"
                value={deletePass} onChange={e => setDeletePass(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancel</button>
                <button className="btn btn-danger" style={{ flex: 1 }} disabled={deleting} onClick={handleDelete}>
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function EyeBtn({ show, toggle }) {
  return (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'
    }}>
      {show ? '🙈' : '👀'}
    </button>    
  );
}