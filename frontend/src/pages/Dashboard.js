import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    const url = isStudent
      ? 'http://localhost:5000/api/complaints/my'
      : 'http://localhost:5000/api/complaints';
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setComplaints(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) { console.error(err); }
  };

  const total     = complaints.length;
  const open      = complaints.filter(c => c.status === 'OPEN').length;
  const resolved  = complaints.filter(c => c.status === 'RESOLVED').length;
  const escalated = complaints.filter(c => c.status === 'ESCALATED').length;

  return (
    <div style={s.shell}>
      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandMark}>E</div>
          <div>
            <div style={s.brandName}>EduResolve</div>
            <div style={s.brandSub}>Campus Portal</div>
          </div>
        </div>

        <nav style={s.nav}>
          <div style={s.navSection}>MENU</div>
          <div style={{ ...s.navItem, ...s.navActive }}>Dashboard</div>
          {isStudent
            ? <div style={s.navItem} onClick={() => navigate('/my-complaints')}>My Complaints</div>
            : <div style={s.navItem} onClick={() => navigate('/all-complaints')}>All Complaints</div>
          }
          <div style={s.navItem} onClick={() => navigate('/submit')}>Submit Complaint</div>
        </nav>

        <div style={s.sideUser}>
          <div style={s.userAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userRole}>{user?.role?.replace('_', ' ')}</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn} title="Sign out">↩</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>{isStudent ? 'My Dashboard' : 'Dashboard Overview'}</h1>
            <div style={s.pageSub}>Welcome back, {user?.name}</div>
          </div>
          <button style={s.primaryBtn} onClick={() => navigate('/submit')}>
            + New Complaint
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: 'Total',     value: total,     accent: '#2563eb' },
            { label: 'Open',      value: open,      accent: '#dc2626' },
            { label: 'Resolved',  value: resolved,  accent: '#16a34a' },
            { label: 'Escalated', value: escalated, accent: '#7c3aed' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statAccent, backgroundColor: st.accent }} />
              <div style={{ ...s.statVal, color: st.accent }}>{st.value}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={s.actionRow}>
          <div style={s.actionCard} onClick={() => navigate('/submit')}>
            <div style={s.actionTitle}>Submit a Complaint</div>
            <div style={s.actionSub}>Report a new campus issue</div>
          </div>
          <div style={{ ...s.actionCard, ...s.actionCardDark }}>
            <div style={{ ...s.actionTitle, color: 'white' }}>
              {total} Complaint{total !== 1 ? 's' : ''}
            </div>
            <div style={{ ...s.actionSub, color: 'rgba(255,255,255,0.6)' }}>
              {open} open · {resolved} resolved · {escalated} escalated
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <div style={s.tableTitle}>
              {isStudent ? 'Recent Complaints' : 'Recent Activity'}
            </div>
            <button style={s.viewAllBtn}
              onClick={() => navigate(isStudent ? '/my-complaints' : '/all-complaints')}>
              View all
            </button>
          </div>

          {loading ? (
            <div style={s.center}>Loading...</div>
          ) : complaints.length === 0 ? (
            <div style={s.center}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>—</div>
              <div style={{ color: '#64748b' }}>No complaints yet</div>
              <button style={{ ...s.primaryBtn, marginTop: '16px' }} onClick={() => navigate('/submit')}>
                Submit your first complaint
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Title', 'Category', !isStudent && 'Student', 'Status', !isStudent && 'Update', 'Date']
                      .filter(Boolean).map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 8).map((c, i) => (
                    <tr key={c.id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                      <td style={s.td}><span style={s.idTag}>#{c.id}</span></td>
                      <td style={{ ...s.td, fontWeight: '500', maxWidth: '220px' }}>
                        <div style={s.ellipsis}>{c.title}</div>
                      </td>
                      <td style={s.td}><span style={s.catTag}>{c.category_name}</span></td>
                      {!isStudent && <td style={{ ...s.td, color: '#64748b' }}>{c.student_name}</td>}
                      <td style={s.td}><span style={statusStyle(c.status)}>{c.status.replace('_', ' ')}</span></td>
                      {!isStudent && (
                        <td style={s.td}>
                          <select value={c.status}
                            onChange={e => handleStatusUpdate(c.id, e.target.value)}
                            style={s.select}>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="ESCALATED">Escalated</option>
                          </select>
                        </td>
                      )}
                      <td style={{ ...s.td, color: '#94a3b8', fontSize: '12px' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function statusStyle(status) {
  const base = { padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'inline-block', letterSpacing: '0.4px' };
  switch (status) {
    case 'OPEN':        return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
    case 'IN_PROGRESS': return { ...base, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' };
    case 'RESOLVED':    return { ...base, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
    case 'ESCALATED':   return { ...base, backgroundColor: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' };
    default:            return { ...base, backgroundColor: '#f1f5f9', color: '#475569' };
  }
}

const SIDEBAR_W = '220px';

const s = {
  shell: { display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', Arial, sans-serif" },

  // Sidebar
  sidebar: { width: SIDEBAR_W, backgroundColor: '#0f2744', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', top: 0, left: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  brandMark: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#2563eb', color: 'white', fontWeight: '800', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandName: { color: 'white', fontWeight: '700', fontSize: '15px' },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '1px' },
  nav: { flex: 1, padding: '16px 12px' },
  navSection: { color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.2px', padding: '8px 10px 6px' },
  navItem: { color: 'rgba(255,255,255,0.6)', padding: '9px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginBottom: '2px' },
  navActive: { backgroundColor: 'rgba(37,99,235,0.25)', color: 'white', fontWeight: '600', borderLeft: '3px solid #2563eb' },
  sideUser: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: 'white', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '1px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '16px', padding: '4px' },

  // Main
  main: { marginLeft: SIDEBAR_W, flex: 1, padding: '28px 32px' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' },
  pageTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 },
  pageSub: { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  primaryBtn: { padding: '9px 18px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '18px 20px', position: 'relative', overflow: 'hidden' },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px' },
  statVal: { fontSize: '30px', fontWeight: '800', lineHeight: 1, marginBottom: '4px', marginTop: '8px' },
  statLbl: { fontSize: '12px', color: '#64748b', fontWeight: '500' },

  // Actions
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  actionCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 20px', cursor: 'pointer' },
  actionCardDark: { backgroundColor: '#0f2744', border: '1px solid #0f2744' },
  actionTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' },
  actionSub: { fontSize: '12px', color: '#64748b' },

  // Table
  tableWrap: { backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  tableHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  tableTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a' },
  viewAllBtn: { fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  trEven: { backgroundColor: 'white' },
  trOdd: { backgroundColor: '#fafafa' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  idTag: { color: '#94a3b8', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' },
  catTag: { backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' },
  select: { padding: '5px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: 'white', cursor: 'pointer', color: '#374151' },
  center: { padding: '60px', textAlign: 'center', color: '#64748b' },
};

export default Dashboard;
