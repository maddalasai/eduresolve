import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── ESCALATION MODAL ─────────────────────────────────────────────────────────
// This is a popup that appears when staff clicks "Escalate"
// They must type a reason before escalating
function EscalateModal({ complaint, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <h3 style={modal.title}>⚡ Escalate to Coordinator</h3>
        <p style={modal.sub}>
          Complaint: <strong>#{complaint.id} — {complaint.title}</strong>
        </p>
        <p style={modal.label}>Reason for escalation (required):</p>
        <textarea
          style={modal.textarea}
          placeholder="e.g. Issue not resolved after 3 days, requires coordinator attention..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
        />
        <div style={modal.btnRow}>
          <button style={modal.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={reason.trim() ? modal.confirmBtn : modal.confirmBtnDisabled}
            disabled={!reason.trim()}
            onClick={() => onConfirm(complaint.id, reason)}
          >
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function SupportStaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [escalateTarget, setEscalateTarget] = useState(null); // which complaint to escalate
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch complaints when page loads
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Accept a complaint — assigns it to this staff member
  const handleAccept = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Complaint accepted! It is now assigned to you.');
      fetchComplaints(); // refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error accepting complaint');
    }
  };

  // Resolve a complaint
  const handleResolve = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status: 'RESOLVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Complaint marked as resolved!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error resolving complaint');
    }
  };

  // Escalate a complaint to coordinator
  const handleEscalate = async (id, reason) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/escalate`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEscalateTarget(null);
      setMessage('⚡ Complaint escalated to Coordinator!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error escalating complaint');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter complaints by tab
  // "open" = unassigned open complaints (available to accept)
  // "mine" = complaints assigned to this staff member
  // "resolved" = complaints this staff resolved
  // "escalated" = complaints this staff escalated
  const openComplaints = complaints.filter(
    c => c.status === 'OPEN' && !c.assigned_to
  );
  const myComplaints = complaints.filter(
    c => c.assigned_to === user?.id && c.status === 'IN_PROGRESS'
  );
  const resolvedComplaints = complaints.filter(
    c => c.assigned_to === user?.id && c.status === 'RESOLVED'
  );
  const escalatedComplaints = complaints.filter(
    c => c.assigned_to === user?.id && c.status === 'ESCALATED'
  );

  const tabs = [
    { id: 'open', label: '🔴 Open', count: openComplaints.length },
    { id: 'mine', label: '📋 My Accepted', count: myComplaints.length },
    { id: 'resolved', label: '✅ Resolved', count: resolvedComplaints.length },
    { id: 'escalated', label: '⚡ Escalated', count: escalatedComplaints.length },
  ];

  const currentList = {
    open: openComplaints,
    mine: myComplaints,
    resolved: resolvedComplaints,
    escalated: escalatedComplaints,
  }[activeTab];

  return (
    <div style={styles.container}>
      {/* ESCALATE MODAL — shows only when a complaint is selected for escalation */}
      {escalateTarget && (
        <EscalateModal
          complaint={escalateTarget}
          onClose={() => setEscalateTarget(null)}
          onConfirm={handleEscalate}
        />
      )}

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <div>
            <div style={styles.sidebarLogoText}>EduResolve</div>
            <div style={styles.sidebarLogoSub}>Support Staff</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navLabel}>NAVIGATION</div>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>
            🏠 Dashboard
          </div>
          <div style={styles.navItem} onClick={() => navigate('/submit')}>
            ➕ Submit Complaint
          </div>
        </nav>

        {/* Stats in sidebar */}
        <div style={styles.sidebarStats}>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>Open</span>
            <span style={{ ...styles.sidebarStatValue, color: '#f87171' }}>
              {openComplaints.length}
            </span>
          </div>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>My Active</span>
            <span style={{ ...styles.sidebarStatValue, color: '#fbbf24' }}>
              {myComplaints.length}
            </span>
          </div>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>Resolved</span>
            <span style={{ ...styles.sidebarStatValue, color: '#4ade80' }}>
              {resolvedComplaints.length}
            </span>
          </div>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>Support Staff</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            🚪
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Support Staff Dashboard</h1>
            <p style={styles.headerSub}>Welcome, {user?.name}! Manage your assigned complaints here.</p>
          </div>
          <button onClick={fetchComplaints} style={styles.refreshBtn}>⟳ Refresh</button>
        </div>

        {/* SUCCESS/ERROR MESSAGE */}
        {message && (
          <div style={styles.messageBox}>
            {message}
          </div>
        )}

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Open (Unassigned)', value: openComplaints.length, color: '#e11d48', bg: '#fff1f2', icon: '🔴' },
            { label: 'My Active', value: myComplaints.length, color: '#d97706', bg: '#fffbeb', icon: '⏳' },
            { label: 'Resolved by Me', value: resolvedComplaints.length, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
            { label: 'Escalated', value: escalatedComplaints.length, color: '#9333ea', bg: '#faf5ff', icon: '⚡' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div style={{ ...styles.statNumber, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={styles.tabRow}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              style={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span style={activeTab === tab.id ? styles.tabBadgeActive : styles.tabBadge}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* COMPLAINTS TABLE */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : currentList.length === 0 ? (
            <div style={styles.center}>
              <div style={{ fontSize: '40px' }}>📭</div>
              <div style={{ color: '#6b7280', marginTop: '8px' }}>No complaints in this category</div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((c, i) => (
                  <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={styles.td}>
                      <span style={styles.idBadge}>#{c.id}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500', maxWidth: '200px' }}>
                      <div style={styles.ellipsis}>{c.title}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.catBadge}>{c.category_name || '—'}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#6b7280' }}>{c.student_name}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(c.status)}>{c.status}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: '2-digit'
                      })}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {/* Show Accept button only for open unassigned complaints */}
                        {activeTab === 'open' && (
                          <button
                            style={styles.acceptBtn}
                            onClick={() => handleAccept(c.id)}
                          >
                            ✋ Accept
                          </button>
                        )}
                        {/* Show Resolve and Escalate for accepted complaints */}
                        {activeTab === 'mine' && (
                          <>
                            <button
                              style={styles.resolveBtn}
                              onClick={() => handleResolve(c.id)}
                            >
                              ✅ Resolve
                            </button>
                            <button
                              style={styles.escalateBtn}
                              onClick={() => setEscalateTarget(c)}
                            >
                              ⚡ Escalate
                            </button>
                          </>
                        )}
                        {/* Show escalation reason for escalated complaints */}
                        {activeTab === 'escalated' && c.escalation_reason && (
                          <span style={styles.reasonText} title={c.escalation_reason}>
                            📝 {c.escalation_reason.substring(0, 30)}...
                          </span>
                        )}
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

// ─── HELPER: Status badge colors ──────────────────────────────────────────────
function getStatusStyle(status) {
  const base = {
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '700', display: 'inline-block'
  };
  switch (status) {
    case 'OPEN': return { ...base, backgroundColor: '#fff1f2', color: '#e11d48' };
    case 'IN_PROGRESS': return { ...base, backgroundColor: '#fffbeb', color: '#d97706' };
    case 'RESOLVED': return { ...base, backgroundColor: '#f0fdf4', color: '#16a34a' };
    case 'ESCALATED': return { ...base, backgroundColor: '#faf5ff', color: '#9333ea' };
    default: return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },

  // Sidebar
  sidebar: { width: '240px', backgroundColor: '#0f2744', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' },
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
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },

  // Main
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSub: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  refreshBtn: { padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  messageBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', color: '#16a34a', fontSize: '14px', marginBottom: '20px', fontWeight: '500' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statIcon: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' },
  statNumber: { fontSize: '30px', fontWeight: '800', lineHeight: 1, marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },

  // Tabs
  tabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
  tabActive: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #4f46e5', backgroundColor: '#4f46e5', cursor: 'pointer', fontSize: '13px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  tabBadge: { backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },

  // Table
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  idBadge: { color: '#94a3b8', fontSize: '12px', fontWeight: '600' },
  catBadge: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' },
  center: { padding: '60px', textAlign: 'center' },

  // Action buttons
  actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  acceptBtn: { padding: '5px 12px', backgroundColor: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  resolveBtn: { padding: '5px 12px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  escalateBtn: { padding: '5px 12px', backgroundColor: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  reasonText: { fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' },
};

// Modal styles
const modal = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  title: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  btnRow: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmBtn: { padding: '10px 20px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmBtnDisabled: { padding: '10px 20px', backgroundColor: '#d1d5db', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },
};

export default SupportStaffDashboard;
