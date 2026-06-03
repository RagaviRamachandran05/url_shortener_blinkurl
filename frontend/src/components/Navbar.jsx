import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import Logo from './Logo';


export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const isActive = (p) => location.pathname === p;
  const isDark   = theme === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { setDropOpen(false); logout(); navigate('/login'); };
  const handleProfile = () => { setDropOpen(false); navigate('/profile'); };

  // Avatar initials from user name
  const initials = user?.avatarInitials || user?.name?.slice(0,2).toUpperCase() || 'U';
  const avatarBg = user?.avatarColor || 'var(--accent)';

  return (
    <nav style={S.nav}>
      <div className="container" style={S.inner}>

        {/* Logo */}

     <Link to="/" style={{ textDecoration: 'none' }}>
  <Logo />
</Link>

        {/* <Link to="/" style={S.logo}>
          <span style={{ fontSize: '1.3rem' }}>⚡</span>
          <span style={S.logoText}>LinkSnap</span>
         
        </Link> */}

        {/* Nav links */}
        {isAuthenticated && (
          <div style={S.links}>
            <Link to="/dashboard" style={{ ...S.link, ...(isActive('/dashboard') ? S.linkActive : {}) }}>Dashboard</Link>
            <Link to="/create"    style={{ ...S.link, ...(isActive('/create')    ? S.linkActive : {}) }}>+ New Link</Link>
          </div>
        )}

        <div style={S.right}>
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            title={isDark ? 'Switch to Nordic Crimson (Light)' : 'Switch to Cyberpunk Amber (Dark)'}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            /* Avatar dropdown */
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{ ...S.avatar, background: avatarBg }}
                title="Profile menu"
                aria-haspopup="true"
                aria-expanded={dropOpen}
              >
                {initials}
              </button>

              {dropOpen && (
                <div style={S.dropdown}>
                  {/* User info header */}
                  <div style={S.dropHeader}>
                    <div style={{ ...S.dropAvatar, background: avatarBg }}>{initials}</div>
                    <div>
                      <div style={S.dropName}>{user?.name}</div>
                      <div style={S.dropEmail}>{user?.email}</div>
                    </div>
                  </div>

                  <div style={S.dropDivider} />

                  

                  <div style={S.dropDivider} />

                  {/* Menu items */}
                  <button style={S.dropItem} onClick={handleProfile}>
                    <span style={S.dropItemIcon}>👤</span> My Profile
                  </button>
                  <Link to="/dashboard" style={S.dropItemLink} onClick={() => setDropOpen(false)}>
                    <span style={S.dropItemIcon}>📊</span> Dashboard
                  </Link>

                  <div style={S.dropDivider} />

                  <button style={{ ...S.dropItem, color: 'var(--negative)' }} onClick={handleLogout}>
                    <span style={S.dropItemIcon}>🚪</span> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const S = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    transition: 'background .18s, border-color .18s',
  },
  inner: { display: 'flex', alignItems: 'center', gap: '1rem', height: '60px' },
  logo:  { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginRight: 'auto' },
  logoText: {
    fontFamily: 'var(--font-mono)', fontWeight: 700,
    fontSize: '1rem', color: 'var(--text-primary)',
  },
  pill: {
    fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px',
    borderRadius: '99px', letterSpacing: '.04em', textTransform: 'uppercase',
  },
  links:      { display: 'flex', gap: '4px' },
  link: {
    padding: '5px 14px', borderRadius: 'var(--radius)',
    fontSize: '0.875rem', fontWeight: 500,
    color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all .15s',
  },
  linkActive: { color: 'var(--text-primary)', background: 'var(--bg-hover)' },
  right: { display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' },

  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '2px solid var(--accent-glow)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.8rem', color: '#fff',
    cursor: 'pointer', letterSpacing: '.04em',
    transition: 'box-shadow .15s',
  },

  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    minWidth: '240px', zIndex: 200,
    overflow: 'hidden',
  },

  dropHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 16px',
  },
  dropAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0,
  },
  dropName:  { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' },
  dropEmail: { fontSize: '0.75rem', color: 'var(--text-secondary)' },
  dropDivider: { height: '1px', background: 'var(--border)', margin: '0' },

  dropSection: { padding: '10px 16px 12px' },
  dropSectionLabel: { fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' },
  themeRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  themeBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 10px', borderRadius: 'var(--radius)',
    background: 'none', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    transition: 'all .15s', textAlign: 'left',
  },
  themeBtnActive: {
    background: 'var(--accent-dim)',
    borderColor: 'var(--accent-glow)',
    color: 'var(--accent-text)',
    fontWeight: 600,
  },

  dropItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 16px',
    background: 'none', border: 'none',
    color: 'var(--text-primary)', fontSize: '0.875rem',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    transition: 'background .12s', textAlign: 'left',
  },
  dropItemLink: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 16px',
    color: 'var(--text-primary)', fontSize: '0.875rem',
    textDecoration: 'none', transition: 'background .12s',
  },
  dropItemIcon: { fontSize: '1rem', width: '20px', textAlign: 'center' },
};
