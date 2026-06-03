// src/components/QRCode.jsx
// Browser-native QR code generator using canvas — no external library needed.
// Uses a simplified QR code algorithm for short URLs.

import React, { useEffect, useRef } from 'react';

// We use the QR Server API (free, no signup) for reliable QR codes
// This is a GET request to a public service — no API key needed

export default function QRCode({ value, size = 150 }) {
  if (!value) return null;

  // Encode the URL for use in the QR API endpoint
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=16161a&color=6ee7b7&format=png`;

  return (
    <div style={{ display: 'inline-block' }}>
      <img
        src={src}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          display: 'block',
          margin: '0 auto',
        }}
        onError={(e) => {
          // Fallback: show a text message if the API is unavailable
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      <p style={{ display: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        QR Code unavailable offline
      </p>
    </div>
  );
}
