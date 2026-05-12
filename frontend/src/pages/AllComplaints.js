import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setComplaints(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setComplaints(complaints.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status) => {
    const base = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
    };
    switch(status) {
      case 'OPEN': return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'IN_PROGRESS': return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
      case 'RESOLVED': return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
      case 'ESCALATED': return { ...base, backgroundColor: '#ede9fe', color: '#7c3aed' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const filtered = filter === 'ALL' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <div>
            <div style={styles.sidebarLogoText}>EduResolve</div>
            <div style={styles.sidebarLogoSub}>Campus Voice</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navLabel}>NAVIGATION</div>
          <div style={styles.navItem} onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </div>
          <div style={{...styles.navItem, ...styles.navItemActive}}>
            📋 All Complaints
          </div>
          <div style={styles.navItem} onClick={() => navigate('/submit')}>
            ➕ Submit Complaint
          </div>
        </nav>
        <div style={styles.sidebarUser}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>{user?.role}</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}
            style={styles.logoutBtn} title="Logout">🚪</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>All Complaints</h1>
            <p style={styles.headerSubtitle}>
              Manage and update all complaints in the system
            </p>
          </div>
          <button onClick={() => navigate('/submit')} style={styles.newBtn}>
            + New Complaint
          </button>
        </div>

        {/* FILTER TABS */}
        <div style={styles.filterRow}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              style={filter === f ? styles.filterBtnActive : styles.filterBtn}>
              {f === 'ALL' ? `All (${complaints.length})` :
               f === 'OPEN' ? `Open (${complaints.filter(c => c.status === 'OPEN').length})` :
               f === 'IN_PROGRESS' ? `In Progress (${complaints.filter(c => c.status === 'IN_PROGRESS').length})` :
               f === 'RESOLVED' ? `Resolved (${complaints.filter(c => c.status === 'RESOLVED').length})` :
               `Escalated (${complaints.filter(c => c.status === 'ESCALATED').length})`}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>📭 No complaints found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Update</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id}
                      style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={styles.td}>
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>#{c.id}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '500', maxWidth: '200px' }}>
                        {c.title}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.catBadge}>{c.category_name}</span>
                      </td>
                      <td style={{ ...styles.td, color: '#6b7280' }}>{c.student_name}</td>
                      <td style={styles.td}>
                        <span style={getStatusStyle(c.status)}>{c.status}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.priorityBadge}>
                          {c.priority_score || 0} pts
                        </span>
                      </td>
                      <td style={styles.td}>
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                          style={styles.select}>
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="ESCALATED">ESCALATED</option>
                        </select>
                      </td>
                      <td style={{ ...styles.td, color: '#9ca3af', fontSize: '13px' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },
  sidebar: { width: '240px', backgroundColor: '#1e1b4b', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh', left: 0, top: 0 },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  sidebarLogoText: { color: 'white', fontWeight: '700', fontSize: '16px' },
  sidebarLogoSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', padding: '8px 8px', marginBottom: '4px' },
  navItem: { color: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '4px' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600' },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  sidebarUserName: { color: 'white', fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sidebarUserRole: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSubtitle: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  newBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: '500' },
  filterBtnActive: { padding: '8px 16px', backgroundColor: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'white', fontWeight: '600' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  loading: { padding: '60px', textAlign: 'center', color: '#6b7280' },
  empty: { padding: '60px', textAlign: 'center', color: '#6b7280', fontSize: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  catBadge: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  priorityBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer', color: '#374151' },
};

export default AllComplaints;