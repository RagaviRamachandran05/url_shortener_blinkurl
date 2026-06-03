
// src/components/Logo.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Logo() {
  const { theme } = useTheme();

  // Dynamic color orchestration based on system theme state
  // Dark Mode (Cyberpunk Amber): Neon Gold accents
  // Light Mode (Nordic Crimson): Rich Velvet Crimson accents
  const isDark = theme === 'dark';
  
  const lightningBoltColor = isDark ? '#FFB300' : '#991B1B'; 
  const chainLinkColor     = isDark ? '#00A3A3' : '#334155'; // Vibrant teal in dark, slate gray in light
  const blinkTextColor     = isDark ? '#FFFFFF' : '#0F172A'; // ⚡ FIX: Pure white for dark mode, deep slate for light mode

  return (
    <div style={styles.container}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={styles.svg}
      >
        {/* Left Link Loop */}
        <path
          d="M35 30H25C13.9543 30 5 38.9543 5 50C5 61.0457 13.9543 70 25 70H35"
          stroke={chainLinkColor}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        
        {/* Right Link Loop */}
        <path
          d="M65 30H75C86.0457 30 95 38.9543 95 50C95 61.0457 86.0457 70 75 70H65"
          stroke={chainLinkColor}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />

        {/* Central High-Voltage Lightning Bolt */}
        <path
          d="M58 10L32 52H52L42 90L68 48H48L58 10Z"
          fill={lightningBoltColor}
          stroke={isDark ? 'rgba(255,179,0,0.3)' : 'none'}
          strokeWidth={isDark ? '4' : '0'}
          style={{ transition: 'all 0.3s ease' }}
        />
      </svg>
      
      {/* Brand Label Typography with Contrast Guard */}
      <span style={{
        ...styles.logoText,
        color: blinkTextColor // Dynamically changes to maintain readability
      }}>
        Blink<span style={{ color: lightningBoltColor, transition: 'color 0.3s ease' }}>URL</span>
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    userSelect: 'none',
  },
  svg: {
    overflow: 'visible',
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase', // Keeps styling unified with your LinkSnap design architecture
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'color 0.3s ease',
  }
};