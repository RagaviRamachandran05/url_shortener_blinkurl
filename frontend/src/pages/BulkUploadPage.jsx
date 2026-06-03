// src/pages/BulkUploadPage.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function BulkUploadPage() {
  const { success, error } = useToast();
  const fileRef = useRef(null);

  const [rows,     setRows]     = useState([]);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // ── Parse uploaded CSV file ─────────────────────────────────────────────────
  const parseFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      error('Please upload a .csv file only.');
      return;
    }
    setFileName(file.name);
    setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const cleaned = data
          .map(row => ({
            url:   (row.url || row.URL || row.Url || '').trim(),
            alias: (row.alias || row.Alias || '').trim(),
          }))
          .filter(r => r.url);

        if (cleaned.length === 0) {
          error('No valid URLs found. Make sure your CSV has a "url" column.');
          return;
        }
        if (cleaned.length > 100) {
          error('Maximum 100 URLs. First 100 will be used.');
          setRows(cleaned.slice(0, 100));
          return;
        }
        setRows(cleaned);
      },
      error: () => error('Failed to parse CSV file.'),
    });
  };

  // ── Drag and drop ───────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    parseFile(e.dataTransfer.files[0]);
  };

  // ── Submit to backend ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (rows.length === 0) { error('Please upload a CSV file first.'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/api/url/bulk', { urls: rows });
      setResults(data.results);
      success(data.message);
    } catch (err) {
      error(err.response?.data?.message || 'Bulk upload failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Download results as CSV ─────────────────────────────────────────────────
  const downloadResults = () => {
    const csv = [
      'Original URL,Short URL,Status,Reason',
      ...results.map(r =>
        `"${r.originalUrl}","${r.shortUrl || ''}","${r.status}","${r.reason || ''}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'linksnap_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset everything ────────────────────────────────────────────────────────
  const reset = () => {
    setRows([]); setResults([]); setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const succeeded = results.filter(r => r.status === 'success').length;
  const failed    = results.filter(r => r.status === 'failed').length;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link to="/dashboard"
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 4px' }}>
            Bulk URL Shortener
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Upload a CSV with up to 100 URLs and shorten them all at once.
          </p>
        </div>

        {/* CSV Format Guide */}
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
          borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-text)', marginBottom: '8px' }}>
            📄 Required CSV Format
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px' }}>
            Must have a <code style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>url</code> column.
            The <code style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>alias</code> column is optional.
          </p>
          <pre style={{
            background: 'var(--bg-base)', borderRadius: 'var(--radius)',
            padding: '10px 14px', fontSize: '0.78rem', margin: 0,
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflowX: 'auto',
          }}>
{`url,alias
https://www.google.com,google
https://www.github.com,github
https://www.mongodb.com/docs,mongo-docs`}
          </pre>
        </div>

        {/* Upload area — only shown before results */}
        {results.length === 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>

            {/* Drag and drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '2.5rem 1rem',
                textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'var(--accent-dim)' : 'var(--bg-hover)',
                transition: 'all .2s', marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📂</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                {fileName ? `✅ ${fileName}` : 'Drop your CSV file here'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {fileName
                  ? `${rows.length} URL${rows.length !== 1 ? 's' : ''} ready to shorten`
                  : 'or click to browse — .csv files only'}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef} type="file" accept=".csv"
              style={{ display: 'none' }}
              onChange={e => parseFile(e.target.files[0])}
            />

            {/* Preview table */}
            {rows.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                  Preview — {rows.length} URL{rows.length !== 1 ? 's' : ''} found
                </div>
                <div style={{
                  maxHeight: '200px', overflowY: 'auto',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        {['#', 'URL', 'Alias'].map(h => (
                          <th key={h} style={{
                            padding: '8px 12px', background: 'var(--bg-surface)',
                            textAlign: 'left', color: 'var(--text-secondary)',
                            borderBottom: '1px solid var(--border)', fontWeight: 600,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: '7px 12px', color: 'var(--text-dim)' }}>{i + 1}</td>
                          <td style={{
                            padding: '7px 12px', maxWidth: '320px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{r.url}</td>
                          <td style={{
                            padding: '7px 12px', fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-text)', fontSize: '0.75rem',
                          }}>{r.alias || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {rows.length > 0 && (
                <button className="btn btn-ghost" onClick={reset}>🗑️ Clear</button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={loading || rows.length === 0}
                style={{ minWidth: '160px', justifyContent: 'center' }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Shortening...</>
                  : `⚡ Shorten ${rows.length > 0 ? rows.length + ' URLs' : 'URLs'}`}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="card">

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 'var(--radius)', padding: '12px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--positive)' }}>
                  {succeeded}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Succeeded</div>
              </div>
              <div style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 'var(--radius)', padding: '12px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--negative)' }}>
                  {failed}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Failed</div>
              </div>
              <div style={{
                background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
                borderRadius: 'var(--radius)', padding: '12px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-text)' }}>
                  {results.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
              </div>
            </div>

            {/* Results table */}
            <div style={{
              maxHeight: '360px', overflowY: 'auto',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '1rem',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {['#', 'Original URL', 'Short URL', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', background: 'var(--bg-surface)',
                        textAlign: 'left', color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)', fontWeight: 600,
                        position: 'sticky', top: 0,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>{i + 1}</td>
                      <td style={{
                        padding: '8px 12px', maxWidth: '240px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{r.originalUrl}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {r.shortUrl
                          ? <span className="mono">{r.shortUrl.replace(/^https?:\/\//, '')}</span>
                          : <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{r.reason}</span>}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        {r.status === 'success'
                          ? <span className="badge badge-green">✓ Done</span>
                          : <span className="badge badge-red">✕ Failed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={reset}>⬆️ Upload Another</button>
              <button className="btn btn-ghost" onClick={downloadResults}>⬇️ Download Results CSV</button>
              <Link to="/dashboard" className="btn btn-primary">View Dashboard</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}