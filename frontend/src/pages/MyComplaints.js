 import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyComplaints() {
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

  const handleUpvote = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setComplaints(complaints.map(c =>
        c.id === id ? {
          ...c,
          upvote_count: res.data.upvoted ? c.upvote_count + 1 : c.upvote_count - 1,
          user_upvoted: res.data.upvoted
        } : c
      ));
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <div>
            <div style={styles.logoText}>EduResolve</div>
            <div style={styles.logoSub}>Campus Voice</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navLabel}>NAVIGATION</div>
          <div style={styles.navItem} onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </div>
          {isStudent ? (
            <div style={{...styles.navItem, ...styles.navItemActive}}>
              📋 My Complaints
            </div>
          ) : (
            <div style={{...styles.navItem, ...styles.navItemActive}}>
              📋 All Complaints
            </div>
          )}
          <div style={styles.navItem} onClick={() => navigate('/submit')}>
            ➕ Submit Complaint
          </div>
        </nav>
        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}
            style={styles.logoutBtn}>🚪</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {isStudent ? '📋 My Complaints' : '📋 All Complaints'}
            </h1>
            <p style={styles.headerSub}>
              {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button onClick={() => navigate('/submit')} style={styles.newBtn}>
            + New Complaint
          </button>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : complaints.length === 0 ? (
            <div style={styles.center}>
              <div style={{ fontSize: '48px' }}>📭</div>
              <p style={{ color: '#6b7280' }}>No complaints found</p>
              <button onClick={() => navigate('/submit')} style={styles.newBtn}>
                Submit your first complaint
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    {!isStudent && <th style={styles.th}>Student</th>}
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Upvotes</th>
                    {!isStudent && <th style={styles.th}>Update Status</th>}
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, i) => (
                    <tr key={c.id}
                      style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={styles.td}>
                        <span style={{ color: '#6b7280' }}>#{c.id}</span>
                      </td>
                      <td style={{...styles.td, fontWeight: '500', maxWidth: '200px'}}>
                        {c.title}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.catBadge}>{c.category_name}</span>
                      </td>
                      {!isStudent && (
                        <td style={{...styles.td, color: '#6b7280'}}>
                          {c.student_name}
                        </td>
                      )}
                      <td style={styles.td}>
                        <span style={getStatusStyle(c.status)}>{c.status}</span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => isStudent && handleUpvote(c.id)}
                          style={{
                            ...styles.upvoteBtn,
                            backgroundColor: c.user_upvoted ? '#ede9fe' : '#f3f4f6',
                            color: c.user_upvoted ? '#7c3aed' : '#6b7280',
                            cursor: isStudent ? 'pointer' : 'default',
                          }}>
                          👍 {c.upvote_count || 0}
                        </button>
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
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },
  sidebar: { width: '240px', backgroundColor: '#1e1b4b', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  logoText: { color: 'white', fontWeight: '700', fontSize: '16px' },
  logoSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', padding: '8px' },
  navItem: { color: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '4px' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600' },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0 },
  userName: { color: 'white', fontSize: '13px', fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginLeft: 'auto' },
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSub: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  newBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', padding: '8px 0' },
  center: { padding: '60px', textAlign: 'center', color: '#6b7280' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  catBadge: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  upvoteBtn: { padding: '4px 12px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: '600' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' },
};

export default MyComplaints;
