// // frontend/src/pages/PublicStatsPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import API from '../utils/api';
// import BarChart from '../components/BarChart'; // Reusing your existing analytical components

// export default function PublicStatsPage() {
//   const { shortCode } = useParams();
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         // Targets the non-protected endpoint cleanly
//         const { data } = await API.get(`/api/url/public-stats/${shortCode}`);
//         setStats(data.data);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to load link statistics.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, [shortCode]);

//   if (loading) return <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>Loading link analytics...</div>;
//   if (error) return <div className="page" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

//   return (
//     <div className="page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
//       {/* Overview Block */}
//       <div style={{ marginBottom: '2rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
//         <span style={{ fontSize: '0.85rem', color: '#008080', fontWeight: 'bold' }}>PUBLIC METRICS PAGE</span>
//         <h1 style={{ margin: '0.5rem 0 0.25rem 0' }}>Stats for /{stats.shortCode}</h1>
//         <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
//           Destination: <a href={stats.longUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{stats.longUrl}</a>
//         </p>
//       </div>

//       {/* Grid Displaying High-level count numbers alongside your charts */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
//         {/* Total Clicks Indicator Card */}
//         <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
//           <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>TOTAL CLICKS</h3>
//           <p style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', fontWeight: 800, color: '#008080' }}>{stats.clicks}</p>
//         </div>

//         {/* Dynamic Analytics Data Chart Component */}
//         <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
//           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Audience Activity Breakdown</h3>
//           {stats.clicks === 0 ? (
//             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No data metrics recorded yet.</p>
//           ) : (
//             <BarChart data={stats.analytics} /> 
//           )}
//         </div>

//       </div>

//       <div style={{ textAlign: 'center', marginTop: '3rem' }}>
//         <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
//           Powered by <strong>BlinkURL</strong>
//         </Link>
//       </div>
//     </div>
//   );
// }





// frontend/src/pages/PublicStatsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import BarChart from '../components/BarChart'; // Reusing your existing analytical components

export default function PublicStatsPage() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Targets the non-protected endpoint cleanly
        const { data } = await API.get(`/api/url/stats/${shortCode}`);
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load link statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  // ─── SAFE RENDER GUARDS ──────────────────────────────────────────────────
  if (loading) {
    return <div className="page" style={{ padding: '2rem', textAlign: 'center' }}>Loading link analytics...</div>;
  }
  
  if (error || !stats) {
    return <div className="page" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error || 'No stats data available.'}</div>;
  }

  // Once both guards pass, stats is guaranteed to be populated!
  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Overview Block */}
      <div style={{ marginBottom: '2rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', color: '#00A3A3', fontWeight: 'bold' }}>PUBLIC METRICS PAGE</span>
        <h1 style={{ margin: '0.5rem 0 0.25rem 0' }}>Stats for /{stats.shortCode}</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
          Destination: <a href={stats.longUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{stats.longUrl}</a>
        </p>
      </div>

      {/* Grid Displaying High-level count numbers alongside your charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        {/* Total Clicks Indicator Card */}
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>TOTAL CLICKS</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', fontWeight: 800, color: '#00A3A3' }}>{stats.clicks}</p>
        </div>

        {/* Dynamic Analytics Data Chart Component */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Audience Activity Breakdown</h3>
          {stats.clicks === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No data metrics recorded yet.</p>
          ) : (
            <BarChart data={stats.analytics} /> 
          )}
        </div>

      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Powered by <strong>BlinkURL</strong>
        </Link>
      </div>
    </div>
  );
}