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
    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setComplaints(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

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
      display: 'inline-block',
    };
    switch(status) {
      case 'OPEN': return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'IN_PROGRESS': return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
      case 'RESOLVED': return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
      case 'ESCALATED': return { ...base, backgroundColor: '#ede9fe', color: '#7c3aed' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'ADMIN': '#4f46e5',
      'STUDENT': '#059669',
      'SUPPORT_STAFF': '#d97706',
      'HOD': '#dc2626',
      'COORDINATOR': '#7c3aed',
      'WARDEN': '#0891b2',
      'HOSTEL_MANAGER': '#be185d',
    };
    return colors[role] || '#6b7280';
  };

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'OPEN').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'ESCALATED').length;

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

          <div style={{...styles.navItem, ...styles.navItemActive}}>
            📊 Dashboard
          </div>

          {isStudent && (
            <div
              style={styles.navItem}
              onClick={() => navigate('/my-complaints')}>
              📋 My Complaints
            </div>
          )}

          {!isStudent && (
            <div
              style={styles.navItem}
              onClick={() => navigate('/all-complaints')}>
              📋 All Complaints
            </div>
          )}

          <div
            style={styles.navItem}
            onClick={() => navigate('/submit')}>
            ➕ Submit Complaint
          </div>
        </nav>

        <div style={styles.sidebarUser}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: getRoleColor(user?.role),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '16px',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>{user?.role}</div>
          </div>
          <button onClick={handleLogout}
            style={styles.logoutBtn} title="Logout">
            🚪
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {isStudent ? 'My Dashboard' : 'Overview'}
            </h1>
            <p style={styles.headerSubtitle}>
              Welcome back, {user?.name}!
            </p>
          </div>
          <button onClick={() => navigate('/submit')}
            style={styles.newComplaintBtn}>
            + New Complaint
          </button>
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statNumber}>{totalComplaints}</div>
            <div style={styles.statLabel}>Total Complaints</div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #dc2626'}}>
            <div style={styles.statIcon}>🔴</div>
            <div style={{...styles.statNumber, color: '#dc2626'}}>
              {openComplaints}
            </div>
            <div style={styles.statLabel}>Open</div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #059669'}}>
            <div style={styles.statIcon}>✅</div>
            <div style={{...styles.statNumber, color: '#059669'}}>
              {resolvedComplaints}
            </div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #7c3aed'}}>
            <div style={styles.statIcon}>⚡</div>
            <div style={{...styles.statNumber, color: '#7c3aed'}}>
              {escalatedComplaints}
            </div>
            <div style={styles.statLabel}>Escalated</div>
          </div>
        </div>

        {/* QUICK ACTION — Submit only */}
        <div style={styles.quickLinks}>
          <div style={styles.quickCard} onClick={() => navigate('/submit')}>
            <div style={styles.quickIcon}>➕</div>
            <div style={styles.quickTitle}>Submit New Complaint</div>
            <div style={styles.quickSub}>Report a new issue on campus</div>
          </div>

          <div style={{
            ...styles.quickCard,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
          }}>
            <div style={styles.quickIcon}>📊</div>
            <div style={{...styles.quickTitle, color: 'white'}}>
              {totalComplaints} Total
            </div>
            <div style={{...styles.quickSub, color: 'rgba(255,255,255,0.8)'}}>
              {openComplaints} open · {resolvedComplaints} resolved · {escalatedComplaints} escalated
            </div>
          </div>
        </div>

        {/* RECENT COMPLAINTS TABLE */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>
              {isStudent ? '📋 Recent Complaints' : '📋 Recent Activity'}
            </h2>
            <button
              onClick={() => navigate(isStudent ? '/my-complaints' : '/all-complaints')}
              style={styles.viewAllBtn}>
              View All →
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : complaints.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
              <div style={{ color: '#6b7280', fontSize: '16px' }}>
                No complaints yet
              </div>
              <button onClick={() => navigate('/submit')}
                style={styles.emptyBtn}>
                Submit your first complaint
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    {!isStudent && <th style={styles.th}>Student</th>}
                    <th style={styles.th}>Status</th>
                    {!isStudent && <th style={styles.th}>Update</th>}
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c, index) => (
                    <tr key={c.id}
                      style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>
                        <span style={styles.idBadge}>#{c.id}</span>
                      </td>
                      <td style={{...styles.td, fontWeight: '500', maxWidth: '200px'}}>
                        {c.title}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>
                          {c.category_name}
                        </span>
                      </td>
                      {!isStudent && (
                        <td style={{...styles.td, color: '#6b7280'}}>
                          {c.student_name}
                        </td>
                      )}
                      <td style={styles.td}>
                        <span style={getStatusStyle(c.status)}>
                          {c.status}
                        </span>
                      </td>
                      {!isStudent && (
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
                      )}
                      <td style={{...styles.td, color: '#9ca3af', fontSize: '13px'}}>
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
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1e1b4b',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '16px',
  },
  sidebarLogoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
  },
  sidebarLogoSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
  },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    padding: '8px 8px',
    marginBottom: '4px',
  },
  navItem: {
    color: 'rgba(255,255,255,0.7)',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '4px',
    transition: 'background 0.2s',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontWeight: '600',
  },
  sidebarUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginTop: 'auto',
  },
  sidebarUserName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sidebarUserRole: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '4px',
  },
  newComplaintBtn: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderTop: '3px solid #4f46e5',
  },
  statIcon: { fontSize: '24px', marginBottom: '8px' },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  quickCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
  },
  quickIcon: { fontSize: '28px', marginBottom: '10px' },
  quickTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  quickSub: {
    fontSize: '13px',
    color: '#6b7280',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  viewAllBtn: {
    padding: '6px 14px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#4f46e5',
    fontWeight: '600',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    color: '#6b7280',
  },
  empty: {
    padding: '60px',
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb',
  },
  trEven: { backgroundColor: 'white' },
  trOdd: { backgroundColor: '#fafafa' },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
  },
  idBadge: {
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '13px',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#374151',
  },
};

export default Dashboard;