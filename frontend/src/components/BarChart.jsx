
// src/components/BarChart.jsx
import React from 'react';

export default function BarChart({ data = [] }) {
  
  // 1. ⚡ AUTO-FILL ZERO CLICKS & SORT LEFT-TO-RIGHT (CHRONOLOGICAL)
  const getProcessedData = () => {
    if (!data || data.length === 0) return [];

    // Create a map of existing database click records for fast lookup
    const dataMap = new Map(data.map(item => [item.date, item.clicks]));
    
    const processed = [];
    const today = new Date();

    // Loop through the last 7 days (or change to 14/30 based on your preference)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // Format as YYYY-MM-DD to match your tracking string patterns
      const dateStr = d.toISOString().split('T')[0];
      
      processed.push({
        date: dateStr,
        // ⚡ If the date is missing from your database, default it cleanly to 0 clicks!
        clicks: dataMap.has(dateStr) ? dataMap.get(dateStr) : 0
      });
    }

    // Sort ascending: Older dates stay LEFT, newer additions flow RIGHT
    return processed.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = getProcessedData();

  if (chartData.length === 0) return null;

  // Find the highest click count for scaling bar heights accurately
  const maxClicks = Math.max(...chartData.map((d) => d.clicks), 1);

  // Format date labels: "Jun 1"
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.mainChartArea}>
        {/* Y-axis labels */}
        <div style={styles.yAxis}>
          <span style={styles.yLabel}>{maxClicks}</span>
          <span style={styles.yLabel}>{Math.round(maxClicks / 2)}</span>
          <span style={styles.yLabel}>0</span>
        </div>

        {/* Bars Canvas Grid Frame */}
        <div style={styles.chartArea}>
          <div style={{ ...styles.gridLine, top: '0%' }} />
          <div style={{ ...styles.gridLine, top: '50%' }} />
          <div style={{ ...styles.gridLine, top: '100%' }} />

          {/* Bar Columns Tracking Row */}
          <div style={styles.barsRow}>
            {chartData.map((d, i) => {
              const pct = (d.clicks / maxClicks) * 100;
              return (
                <div key={i} style={styles.barCol}>
                  {/* The vertical bar rectangle shape */}
                  <div style={styles.barFrame}>
                    <div style={{
                      ...styles.bar,
                      // Give 0-click days a tiny 2% baseline marker height so it looks like a graph grid
                      height: d.clicks === 0 ? '2%' : `${Math.max(pct, 5)}%`,
                      // Dim down the zero-click bars slightly so active spikes stand out
                      opacity: d.clicks === 0 ? 0.25 : 0.85,
                    }} />
                  </div>

                  {/* Date Stamp Label below bar */}
                  <div style={styles.xLabel}>{formatDate(d.date)}</div>

                  {/* ⚡ Clean Count Badge placed directly below its matching date block */}
                  <div style={{
                    ...styles.countBadge,
                    color: d.clicks === 0 ? 'var(--text-dim, #6b7280)' : 'var(--accent, #00A3A3)',
                    borderColor: d.clicks === 0 ? 'rgba(255,255,255,0.05)' : 'var(--border)'
                  }}>
                    {d.clicks}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display:    'flex',
    flexDirection: 'column',
    marginTop:  '1.25rem',
    background: 'var(--bg-surface, #111214)',
    padding:    '1.5rem 1.25rem',
    borderRadius: '12px',
    border:     '1px solid var(--border, #262626)',
  },
  mainChartArea: {
    display:    'flex',
    gap:        '0.75rem',
    height:     '180px', 
  },
  yAxis: {
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
    paddingBottom:  '44px', // Aligns metric lines with the baseline grid height perfectly
    flexShrink:     0,
    width:          '24px',
  },
  yLabel: {
    fontSize:   '0.65rem',
    color:      'var(--text-dim, #6b7280)',
    fontFamily: 'var(--font-mono)',
  },
  chartArea: {
    flex:     1,
    position: 'relative',
    overflow: 'visible',
  },
  gridLine: {
    position:    'absolute',
    left:        0,
    right:       0,
    borderTop:   '1px dashed var(--border, #262626)',
    opacity:     0.15,
    pointerEvents: 'none',
  },
  barsRow: {
    display:        'flex',
    justifyContent: 'space-between',
    height:         '100%',
    position:       'relative',
    width:          '100%',
  },
  barCol: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    flex:           1,
    height:         '100%',
    position:       'relative',
    minWidth:       0,
  },
  barFrame: {
    height:         'calc(100% - 44px)', // Deducts padding space allocated for stacked text metadata labels below
    width:          '100%',
    display:        'flex',
    alignItems:     'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width:        '16px', // fixed width to prevent fat bars
    background:   'var(--accent, #00A3A3)',
    borderRadius: '4px 4px 0 0',
    transition:   'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  xLabel: {
    fontSize:   '0.65rem',
    color:      'var(--text-dim, #6b7280)',
    textAlign:  'center',
    marginTop:  '6px',
    whiteSpace: 'nowrap',
  },
  countBadge: {
    background: 'rgba(255, 255, 255, 0.02)',
    border:     '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding:    '2px 6px',
    marginTop:  '4px',
    fontSize:   '0.65rem',
    whiteSpace: 'nowrap',
    textAlign:  'center',
    fontWeight: 700,
    minWidth:   '18px',
  }
};