 import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [complaintsRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/complaints/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setComplaints(complaintsRes.data);
      setAnalytics(analyticsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
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
      padding: '4px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600', display: 'inline-block',
    };
    switch(status) {
      case 'OPEN': return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'IN_PROGRESS': return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
      case 'RESOLVED': return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
      case 'ESCALATED': return { ...base, backgroundColor: '#ede9fe', color: '#7c3aed' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'ADMIN': { bg: '#ede9fe', color: '#7c3aed' },
      'STUDENT': { bg: '#d1fae5', color: '#059669' },
      'SUPPORT_STAFF': { bg: '#fef3c7', color: '#d97706' },
      'HOD': { bg: '#fee2e2', color: '#dc2626' },
      'COORDINATOR': { bg: '#e0e7ff', color: '#4338ca' },
      'WARDEN': { bg: '#e0f2fe', color: '#0284c7' },
      'HOSTEL_MANAGER': { bg: '#fce7f3', color: '#be185d' },
      'LIBRARIAN': { bg: '#f0fdf4', color: '#15803d' },
      'TRANSPORT_MANAGER': { bg: '#fff7ed', color: '#c2410c' },
    };
    const c = colors[role] || { bg: '#f3f4f6', color: '#6b7280' };
    return {
      backgroundColor: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '600',
    };
  };

  const stats = analytics?.stats || {};
  const byCategory = analytics?.byCategory || [];

  const renderOverview = () => (
    <div>
      {/* BIG STATS */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total', value: stats.total || 0, color: '#4f46e5', icon: '📝' },
          { label: 'Open', value: stats.open || 0, color: '#dc2626', icon: '🔴' },
          { label: 'In Progress', value: stats.in_progress || 0, color: '#d97706', icon: '🟡' },
          { label: 'Resolved', value: stats.resolved || 0, color: '#059669', icon: '✅' },
          { label: 'Escalated', value: stats.escalated || 0, color: '#7c3aed', icon: '⚡' },
        ].map(s => (
          <div key={s.label} style={{...styles.statCard, borderTop: `3px solid ${s.color}`}}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={{...styles.statNumber, color: s.color}}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>📂 Complaints by Category</h2>
        </div>
        <div style={{ padding: '20px' }}>
          {byCategory.map(cat => (
            <div key={cat.name} style={styles.catRow}>
              <div style={styles.catName}>{cat.name || 'Uncategorized'}</div>
              <div style={styles.catBarWrap}>
                <div style={{
                  ...styles.catBar,
                  width: `${Math.min((cat.count / (stats.total || 1)) * 100, 100)}%`
                }}/>
              </div>
              <div style={styles.catCount}>{cat.count}</div>
            </div>
          ))}
          {byCategory.length === 0 && (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No category data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderComplaints = () => (
    <div style={styles.tableCard}>
      <div style={styles.tableHeader}>
        <h2 style={styles.tableTitle}>📋 All Complaints ({complaints.length})</h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Upvotes</th>
              <th style={styles.th}>Update</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c, i) => (
              <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={styles.td}><span style={{ color: '#6b7280' }}>#{c.id}</span></td>
                <td style={{...styles.td, fontWeight: '500', maxWidth: '180px'}}>{c.title}</td>
                <td style={styles.td}>
                  <span style={styles.catBadge}>{c.category_name}</span>
                </td>
                <td style={{...styles.td, color: '#6b7280'}}>{c.student_name}</td>
                <td style={styles.td}>
                  <span style={getStatusStyle(c.status)}>{c.status}</span>
                </td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <span style={styles.upvoteBadge}>👍 {c.upvote_count || 0}</span>
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
                <td style={{...styles.td, color: '#9ca3af', fontSize: '13px'}}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div style={styles.tableCard}>
      <div style={styles.tableHeader}>
        <h2 style={styles.tableTitle}>👥 All Users</h2>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          Fetched from complaints data
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        {/* Extract unique users from complaints */}
        {(() => {
          const seen = new Set();
          const uniqueUsers = complaints
            .filter(c => {
              if (seen.has(c.student_email)) return false;
              seen.add(c.student_email);
              return true;
            })
            .map(c => ({
              name: c.student_name,
              email: c.student_email,
              complaints: complaints.filter(x => x.student_email === c.student_email).length
            }));
          return uniqueUsers.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No user data yet
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Complaints</th>
                </tr>
              </thead>
              <tbody>
                {uniqueUsers.map((u, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatar}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{...styles.td, color: '#6b7280'}}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={styles.catBadge}>{u.complaints} complaints</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: '24px' }}>🎓</span>
          <div>
            <div style={styles.sidebarLogoText}>EduResolve</div>
            <div style={styles.sidebarLogoSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navLabel}>ADMIN MENU</div>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'complaints', icon: '📋', label: 'All Complaints' },
            { id: 'users', icon: '👥', label: 'Users' },
          ].map(item => (
            <div
              key={item.id}
              style={activeTab === item.id
                ? {...styles.navItem, ...styles.navItemActive}
                : styles.navItem}
              onClick={() => setActiveTab(item.id)}>
              {item.icon} {item.label}
            </div>
          ))}
          <div style={styles.navItem} onClick={() => navigate('/submit')}>
            ➕ Submit Complaint
          </div>
        </nav>

        <div style={styles.sidebarUser}>
          <div style={styles.avatarSmall}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>ADMIN</div>
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
              {activeTab === 'overview' && '📊 Admin Overview'}
              {activeTab === 'complaints' && '📋 All Complaints'}
              {activeTab === 'users' && '👥 User Management'}
            </h1>
            <p style={styles.headerSubtitle}>Welcome back, {user?.name}!</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
            Loading...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'complaints' && renderComplaints()}
            {activeTab === 'users' && renderUsers()}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },
  sidebar: { width: '240px', backgroundColor: '#1e1b4b', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  sidebarLogoText: { color: 'white', fontWeight: '700', fontSize: '16px' },
  sidebarLogoSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  nav: { flex: 1, padding: '0 12px' },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', padding: '8px', marginBottom: '4px' },
  navItem: { color: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '4px' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600' },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  sidebarUserName: { color: 'white', fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sidebarUserRole: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginLeft: 'auto' },
  avatarSmall: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0, fontSize: '14px' },
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSubtitle: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statIcon: { fontSize: '22px', marginBottom: '8px' },
  statNumber: { fontSize: '30px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '24px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f3f4f6' },
  tableTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  catBadge: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  upvoteBadge: { backgroundColor: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  select: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' },
  catRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  catName: { width: '150px', fontSize: '13px', color: '#374151', fontWeight: '500' },
  catBarWrap: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: '4px', height: '8px' },
  catBar: { backgroundColor: '#4f46e5', height: '8px', borderRadius: '4px', transition: 'width 0.3s' },
  catCount: { width: '30px', fontSize: '13px', fontWeight: '600', color: '#4f46e5', textAlign: 'right' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 },
};

export default AdminDashboard;
