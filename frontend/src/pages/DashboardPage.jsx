// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext'; // Import Auth context
import { useToast } from '../context/ToastContext';
import EditUrlModal from '../components/EditUrlModal';

export default function DashboardPage() {
  const { user } = useAuth(); // Destructure logged-in user details
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [urls,      setUrls]    = useState([]);
  const [loading,   setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for manual reloads
  const [editUrl,   setEditUrl] = useState(null); // URL being edited

  // Fetch user's URLs from the API
  const fetchUrls = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await API.get('/api/url/all');
      setUrls(data.urls);
      if (isManualRefresh) {
        success('Dashboard updated successfully!');
      }
    } catch (err) {
      error('Failed to load URLs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [error, success]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  // Copy short URL to clipboard
  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl).then(() => success('Copied!'));
  };

  // Delete a URL with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link and all its analytics? This cannot be undone.')) return;
    try {
      await API.delete(`/api/url/${id}`);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      success('Link deleted.');
    } catch {
      error('Failed to delete link.');
    }
  };

  // After successful edit, update the URL in local state
  const handleEditSave = (updatedUrl) => {
    setUrls((prev) => prev.map((u) => u.id === updatedUrl.id ? { ...u, ...updatedUrl } : u));
    setEditUrl(null);
  };

  // Check if a URL has expired
  const isExpired = (url) => url.expiryDate && new Date(url.expiryDate) < new Date();

  // Format a date for display
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Truncate a long URL for display
  const truncate = (str, n = 35) => str.length > n ? str.slice(0, n) + '...' : str;

  // Helper function to extract short code from shortUrl string securely
  const getShortCode = (shortUrlStr) => {
    if (!shortUrlStr) return '';
    const parts = shortUrlStr.split('/');
    return parts[parts.length - 1];
  };

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-center" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="spinner" />
        <span>Loading your links...</span>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        
        {/* Header containing Welcome message & Action row */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Welcome back, {user?.name || 'User'}! 👋</h1>
            <p style={styles.subtitle}>{urls.length} link{urls.length !== 1 ? 's' : ''} total</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Functional Refresh Button */}
            <button 
              className="btn btn-ghost" 
              onClick={() => fetchUrls(true)}
              disabled={refreshing}
              style={styles.refreshBtn}
            >
              <span style={{
                display: 'inline-block',
                transform: refreshing ? 'rotate(360deg)' : 'none',
                transition: refreshing ? 'transform 0.8s linear infinite' : 'transform 0.2s ease',
              }}>
                🔄
              </span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <Link to="/create" className="btn btn-primary">+ New Link</Link>
            <Link to="/bulk" className="btn btn-ghost">📂 Bulk Upload</Link>
          </div>
        </div>

        {/* Stats bar */}
        {urls.length > 0 && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statNum}>{urls.length}</span>
              <span style={styles.statLabel}>Total Links</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNum}>{urls.reduce((a, u) => a + u.clicks, 0).toLocaleString()}</span>
              <span style={styles.statLabel}>Total Clicks</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNum}>{urls.filter((u) => !isExpired(u)).length}</span>
              <span style={styles.statLabel}>Active Links</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {urls.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
            <h3>No links yet</h3>
            <p>Create your first short link and start tracking clicks.</p>
            <Link to="/create" className="btn btn-primary">Create Your First Link</Link>
          </div>
        ) : (
          /* URL Table */
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short URL</th>
                  <th className="hide-mobile">Created</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id}>
                    {/* Original URL */}
                    <td style={{ maxWidth: 200, minWidth: 120, wordBreak: 'break-all', whiteSpace: 'normal' }}>
                      <a href={url.originalUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--text)', textDecoration: 'none' }}
                        title={url.originalUrl}>
                        {truncate(url.originalUrl)}
                      </a>
                    </td>

                    {/* Short URL */}
                    <td style={{ maxWidth: 160, minWidth: 100 }}>
                      <span className="mono" style={{ wordBreak: 'break-all', whiteSpace: 'normal', display: 'block' }}>
                        {url.shortUrl?.replace(/^https?:\/\//, '')}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {fmt(url.createdAt)}
                    </td>

                    {/* Clicks */}
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        {url.clicks.toLocaleString()}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td>
                      {isExpired(url)
                        ? <span className="badge badge-red">Expired</span>
                        : <span className="badge badge-green">Active</span>}
                    </td>

                    {/* Action buttons */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" title="Copy Short URL" onClick={() => handleCopy(url.shortUrl)}>
                          📋
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Private Dashboard Analytics" onClick={() => navigate(`/analytics/${url.id}`)}>
                          📊
                        </button>
                        
                        {/* LINK TO VIEW THE UNPROTECTED PUBLIC STATS PAGE */}
                        <a 
                          href={`/stats/${getShortCode(url.shortUrl)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-ghost btn-sm" 
                          title="View Shareable Public Stats Page"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          🌐
                        </a>

                        <button className="btn btn-ghost btn-sm" title="Edit Destination" onClick={() => setEditUrl(url)}>
                          ✏️
                        </button>
                        <button className="btn btn-danger btn-sm" title="Delete Link" onClick={() => handleDelete(url.id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUrl && (
        <EditUrlModal
          url={editUrl}
          onClose={() => setEditUrl(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

const styles = {
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '1.5rem',
    flexWrap:       'wrap',
    gap:            '1rem',
  },
  title: {
    fontSize:  '1.5rem',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color:    'var(--text-muted)',
    fontSize: '0.875rem',
    margin:   '4px 0 0 0',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--border)',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    background: 'var(--bg-card)',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--text)',
  },
  statsBar: {
    display:      'flex',
    gap:          '0',
    background:   'var(--bg-card)',
    border:       '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding:      '1rem 1.5rem',
    marginBottom: '1.5rem',
  },
  statItem: {
    display:       'flex',
    flexDirection: 'column',
    flex:          1,
    alignItems:    'center',
  },
  statNum: {
    fontFamily: 'var(--font-mono)',
    fontSize:   '1.4rem',
    fontWeight: 700,
    color:      'var(--accent)',
  },
  statLabel: {
    fontSize: '0.75rem',
    color:    'var(--text-muted)',
    marginTop: '0.2rem',
  },
  statDivider: {
    width:      '1px',
    background: 'var(--border)',
    margin:     '0 1rem',
  },
};




// // src/pages/DashboardPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import API from '../utils/api';
// import { useAuth } from '../context/AuthContext'; // Import Auth context
// import { useToast } from '../context/ToastContext';
// import EditUrlModal from '../components/EditUrlModal';

// export default function DashboardPage() {
//   const { user } = useAuth(); // Destructure logged-in user details
//   const { success, error } = useToast();
//   const navigate = useNavigate();

//   const [urls,      setUrls]    = useState([]);
//   const [loading,   setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false); // State for manual reloads
//   const [editUrl,   setEditUrl] = useState(null); // URL being edited

//   // Fetch user's URLs from the API
//   const fetchUrls = useCallback(async (isManualRefresh = false) => {
//     if (isManualRefresh) setRefreshing(true);
//     else setLoading(true);

//     try {
//       const { data } = await API.get('/api/url/all');
//       setUrls(data.urls);
//       if (isManualRefresh) {
//         success('Dashboard updated successfully!');
//       }
//     } catch (err) {
//       error('Failed to load URLs.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [error, success]);

//   useEffect(() => { fetchUrls(); }, [fetchUrls]);

//   // Copy short URL to clipboard
//   const handleCopy = (shortUrl) => {
//     navigator.clipboard.writeText(shortUrl).then(() => success('Copied!'));
//   };

//   // Delete a URL with confirmation
//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this link and all its analytics? This cannot be undone.')) return;
//     try {
//       await API.delete(`/api/url/${id}`);
//       setUrls((prev) => prev.filter((u) => u.id !== id));
//       success('Link deleted.');
//     } catch {
//       error('Failed to delete link.');
//     }
//   };

//   // After successful edit, update the URL in local state
//   const handleEditSave = (updatedUrl) => {
//     setUrls((prev) => prev.map((u) => u.id === updatedUrl.id ? { ...u, ...updatedUrl } : u));
//     setEditUrl(null);
//   };

//   // Check if a URL has expired
//   const isExpired = (url) => url.expiryDate && new Date(url.expiryDate) < new Date();

//   // Format a date for display
//   const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

//   // Truncate a long URL for display
//   const truncate = (str, n = 35) => str.length > n ? str.slice(0, n) + '...' : str;

//   // ─── Loading State ──────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="loading-center" style={{ height: 'calc(100vh - 60px)' }}>
//         <div className="spinner" />
//         <span>Loading your links...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="page">
//       <div className="container">
        
//         {/* Header containing Welcome message & Action row */}
//         <div style={styles.header}>
//           <div>
//             <h1 style={styles.title}>Welcome back, {user?.name || 'User'}! 👋</h1>
//             <p style={styles.subtitle}>{urls.length} link{urls.length !== 1 ? 's' : ''} total</p>
//           </div>
          
//           <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
//             {/* Functional Refresh Button */}
//             <button 
//               className="btn btn-ghost" 
//               onClick={() => fetchUrls(true)}
//               disabled={refreshing}
//               style={styles.refreshBtn}
//             >
//               <span style={{
//                 display: 'inline-block',
//                 transform: refreshing ? 'rotate(360deg)' : 'none',
//                 transition: refreshing ? 'transform 0.8s linear infinite' : 'transform 0.2s ease',
//               }}>
//                 🔄
//               </span>
//               {refreshing ? 'Refreshing...' : 'Refresh'}
//             </button>
            
//             <Link to="/create" className="btn btn-primary">+ New Link</Link>
//             <Link to="/bulk" className="btn btn-ghost">📂 Bulk Upload</Link>
//           </div>
//         </div>

//         {/* Stats bar */}
//         {urls.length > 0 && (
//           <div style={styles.statsBar}>
//             <div style={styles.statItem}>
//               <span style={styles.statNum}>{urls.length}</span>
//               <span style={styles.statLabel}>Total Links</span>
//             </div>
//             <div style={styles.statDivider} />
//             <div style={styles.statItem}>
//               <span style={styles.statNum}>{urls.reduce((a, u) => a + u.clicks, 0).toLocaleString()}</span>
//               <span style={styles.statLabel}>Total Clicks</span>
//             </div>
//             <div style={styles.statDivider} />
//             <div style={styles.statItem}>
//               <span style={styles.statNum}>{urls.filter((u) => !isExpired(u)).length}</span>
//               <span style={styles.statLabel}>Active Links</span>
//             </div>
//           </div>
//         )}

//         {/* Empty state */}
//         {urls.length === 0 ? (
//           <div className="empty-state">
//             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
//             <h3>No links yet</h3>
//             <p>Create your first short link and start tracking clicks.</p>
//             <Link to="/create" className="btn btn-primary">Create Your First Link</Link>
//           </div>
//         ) : (
//           /* URL Table */
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Original URL</th>
//                   <th>Short URL</th>
//                   <th className="hide-mobile">Created</th>
//                   <th>Clicks</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {urls.map((url) => (
//                   <tr key={url.id}>
//                     {/* Original URL */}
//                     <td style={{ maxWidth: 200, minWidth: 120, wordBreak: 'break-all', whiteSpace: 'normal' }}>
//                       <a href={url.originalUrl} target="_blank" rel="noopener noreferrer"
//                         style={{ color: 'var(--text)', textDecoration: 'none' }}
//                         title={url.originalUrl}>
//                         {truncate(url.originalUrl)}
//                       </a>
//                     </td>

//                     {/* Short URL */}
//                     <td style={{ maxWidth: 160, minWidth: 100 }}>
//                       <span className="mono" style={{ wordBreak: 'break-all', whiteSpace: 'normal', display: 'block' }}>
//                         {url.shortUrl?.replace(/^https?:\/\//, '')}
//                       </span>
//                     </td>

//                     {/* Created date */}
//                     <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
//                       {fmt(url.createdAt)}
//                     </td>

//                     {/* Clicks */}
//                     <td>
//                       <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
//                         {url.clicks.toLocaleString()}
//                       </span>
//                     </td>

//                     {/* Status badge */}
//                     <td>
//                       {isExpired(url)
//                         ? <span className="badge badge-red">Expired</span>
//                         : <span className="badge badge-green">Active</span>}
//                     </td>

//                     {/* Action buttons */}
//                     <td>
//                       <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
//                         <button className="btn btn-ghost btn-sm" title="Copy" onClick={() => handleCopy(url.shortUrl)}>
//                           📋
//                         </button>
//                         <button className="btn btn-ghost btn-sm" title="Analytics" onClick={() => navigate(`/analytics/${url.id}`)}>
//                           📊
//                         </button>
//                         <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditUrl(url)}>
//                           ✏️
//                         </button>
//                         <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(url.id)}>
//                           🗑️
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Edit modal */}
//       {editUrl && (
//         <EditUrlModal
//           url={editUrl}
//           onClose={() => setEditUrl(null)}
//           onSave={handleEditSave}
//         />
//       )}
//     </div>
//   );
// }

// const styles = {
//   header: {
//     display:        'flex',
//     justifyContent: 'space-between',
//     alignItems:     'center',
//     marginBottom:   '1.5rem',
//     flexWrap:       'wrap',
//     gap:            '1rem',
//   },
//   title: {
//     fontSize:  '1.5rem',
//     fontWeight: 700,
//     margin: 0,
//   },
//   subtitle: {
//     color:    'var(--text-muted)',
//     fontSize: '0.875rem',
//     margin:   '4px 0 0 0',
//   },
//   refreshBtn: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     border: '1px solid var(--border)',
//     padding: '0.45rem 0.85rem',
//     borderRadius: 'var(--radius-md)',
//     cursor: 'pointer',
//     background: 'var(--bg-card)',
//     fontWeight: 600,
//     fontSize: '0.85rem',
//     color: 'var(--text)',
//   },
//   statsBar: {
//     display:      'flex',
//     gap:          '0',
//     background:   'var(--bg-card)',
//     border:       '1px solid var(--border)',
//     borderRadius: 'var(--radius-lg)',
//     padding:      '1rem 1.5rem',
//     marginBottom: '1.5rem',
//   },
//   statItem: {
//     display:       'flex',
//     flexDirection: 'column',
//     flex:          1,
//     alignItems:    'center',
//   },
//   statNum: {
//     fontFamily: 'var(--font-mono)',
//     fontSize:   '1.4rem',
//     fontWeight: 700,
//     color:      'var(--accent)',
//   },
//   statLabel: {
//     fontSize: '0.75rem',
//     color:    'var(--text-muted)',
//     marginTop: '0.2rem',
//   },
//   statDivider: {
//     width:      '1px',
//     background: 'var(--border)',
//     margin:     '0 1rem',
//   },
// };