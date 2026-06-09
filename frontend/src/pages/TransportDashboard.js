import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Transport Manager sees only transport complaints and can resolve or escalate to Admin
function TransportDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints', { headers: { Authorization: `Bearer ${token}` } });
      setComplaints(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${id}/status`, { status: 'RESOLVED' }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Complaint resolved!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('❌ Error'); }
  };

  const handleEscalate = async (id) => {
    const reason = window.prompt('Enter reason for escalating to Admin:');
    if (!reason) return;
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${id}/escalate`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('⚡ Escalated to Admin!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('❌ Error'); }
  };

  const open = complaints.filter(c => c.status === 'OPEN');
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS');
  const resolved = complaints.filter(c => c.status === 'RESOLVED');
  const escalated = complaints.filter(c => c.status === 'ESCALATED');

  const tabs = [
    { id: 'all', label: '🚌 All', count: complaints.length },
    { id: 'open', label: '🔴 Open', count: open.length },
    { id: 'resolved', label: '✅ Resolved', count: resolved.length },
    { id: 'escalated', label: '⚡ Escalated', count: escalated.length },
  ];

  const currentList = { all: complaints, open, inprogress: inProgress, resolved, escalated }[activeTab];

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: '28px' }}>🚌</span>
          <div>
            <div style={styles.sidebarLogoText}>EduResolve</div>
            <div style={styles.sidebarLogoSub}>Transport Manager</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navLabel}>NAVIGATION</div>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>🚌 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate('/submit')}>➕ Submit Complaint</div>
        </nav>
        <div style={styles.sidebarStats}>
          <div style={styles.sidebarStatItem}><span style={styles.sidebarStatLabel}>Total</span><span style={{ ...styles.sidebarStatValue, color: '#818cf8' }}>{complaints.length}</span></div>
          <div style={styles.sidebarStatItem}><span style={styles.sidebarStatLabel}>Open</span><span style={{ ...styles.sidebarStatValue, color: '#f87171' }}>{open.length}</span></div>
          <div style={styles.sidebarStatItem}><span style={styles.sidebarStatLabel}>Resolved</span><span style={{ ...styles.sidebarStatValue, color: '#4ade80' }}>{resolved.length}</span></div>
        </div>
        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>Transport Manager</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>🚪</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Transport Complaints</h1>
            <p style={styles.headerSub}>Manage all transport-related complaints — bus routes, timing, driver issues, etc.</p>
          </div>
          <button onClick={fetchComplaints} style={styles.refreshBtn}>⟳ Refresh</button>
        </div>

        {message && <div style={styles.messageBox}>{message}</div>}

        <div style={styles.statsGrid}>
          {[
            { label: 'Total', value: complaints.length, color: '#0369a1', bg: '#f0f9ff', icon: '🚌' },
            { label: 'Open', value: open.length, color: '#e11d48', bg: '#fff1f2', icon: '🔴' },
            { label: 'Resolved', value: resolved.length, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
            { label: 'Escalated', value: escalated.length, color: '#9333ea', bg: '#faf5ff', icon: '⚡' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: s.bg, color: s.color }}>{s.icon}</div>
              <div style={{ ...styles.statNumber, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.infoBox}>
          <strong>🚌 Your Role:</strong> You handle all transport complaints — bus delays, route issues, driver behavior, etc.
          Resolve operational issues directly. Escalate to Admin for policy or budget decisions.
        </div>

        <div style={styles.tabRow}>
          {tabs.map(tab => (
            <button key={tab.id} style={activeTab === tab.id ? styles.tabActive : styles.tab} onClick={() => setActiveTab(tab.id)}>
              {tab.label} <span style={activeTab === tab.id ? styles.tabBadgeActive : styles.tabBadge}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div style={styles.tableCard}>
          {loading ? <div style={styles.center}>Loading...</div> : currentList.length === 0 ? (
            <div style={styles.center}><div style={{ fontSize: '40px' }}>📭</div><div style={{ color: '#6b7280', marginTop: '8px' }}>No transport complaints here</div></div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {['ID', 'Title', 'Student', 'Status', 'Upvotes', 'Date', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {currentList.map((c, i) => (
                  <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={styles.td}><span style={styles.idBadge}>#{c.id}</span></td>
                    <td style={{ ...styles.td, fontWeight: '500' }}><div style={styles.ellipsis}>{c.title}</div></td>
                    <td style={{ ...styles.td, color: '#6b7280' }}>{c.student_name}</td>
                    <td style={styles.td}><span style={getStatusStyle(c.status)}>{c.status}</span></td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.upvoteBadge}>👍 {c.upvote_count || 0}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {c.status !== 'RESOLVED' && c.status !== 'ESCALATED' && (
                          <>
                            <button style={styles.resolveBtn} onClick={() => handleResolve(c.id)}>✅ Resolve</button>
                            <button style={styles.escalateBtn} onClick={() => handleEscalate(c.id)}>⚡ Escalate</button>
                          </>
                        )}
                        {c.status === 'RESOLVED' && <span style={styles.resolvedBadge}>✅ Done</span>}
                        {c.status === 'ESCALATED' && <span style={styles.escalatedBadge}>⚡ Escalated</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  const base = { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-block' };
  switch (status) {
    case 'OPEN': return { ...base, backgroundColor: '#fff1f2', color: '#e11d48' };
    case 'IN_PROGRESS': return { ...base, backgroundColor: '#fffbeb', color: '#d97706' };
    case 'RESOLVED': return { ...base, backgroundColor: '#f0fdf4', color: '#16a34a' };
    case 'ESCALATED': return { ...base, backgroundColor: '#faf5ff', color: '#9333ea' };
    default: return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },
  sidebar: { width: '240px', backgroundColor: '#0c4a6e', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  sidebarLogoText: { color: 'white', fontWeight: '700', fontSize: '16px' },
  sidebarLogoSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', padding: '8px 8px', marginBottom: '4px' },
  navItem: { color: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '4px' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600' },
  sidebarStats: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' },
  sidebarStatItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  sidebarStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '12px' },
  sidebarStatValue: { fontWeight: '700', fontSize: '14px' },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px' },
  sidebarUserName: { color: 'white', fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sidebarUserRole: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSub: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  refreshBtn: { padding: '8px 16px', backgroundColor: '#0369a1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  messageBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', color: '#16a34a', fontSize: '14px', marginBottom: '20px', fontWeight: '500' },
  infoBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px 16px', color: '#0369a1', fontSize: '13px', marginBottom: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' },
  statNumber: { fontSize: '28px', fontWeight: '800', lineHeight: 1, marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
  tabRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  tab: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #0369a1', backgroundColor: '#0369a1', cursor: 'pointer', fontSize: '13px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  tabBadge: { backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  idBadge: { color: '#94a3b8', fontSize: '12px', fontWeight: '600' },
  upvoteBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' },
  center: { padding: '60px', textAlign: 'center' },
  actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  resolveBtn: { padding: '5px 12px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  escalateBtn: { padding: '5px 12px', backgroundColor: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  resolvedBadge: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  escalatedBadge: { backgroundColor: '#faf5ff', color: '#9333ea', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
};

export default TransportDashboard;
