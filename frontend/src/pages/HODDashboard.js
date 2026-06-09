import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── ESCALATION MODAL ─────────────────────────────────────────────────────────
function EscalateModal({ complaint, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  const reasons = [
    'Requires Admin-level policy decision',
    'Budget allocation needed — beyond HOD authority',
    'Repeated issue — systemic problem',
    'Multiple departments involved',
    'Student safety concern',
    'Legal or compliance issue',
    'Other (specify below)',
  ];

  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <h3 style={modal.title}>🚨 Escalate to Admin</h3>
        <p style={modal.sub}>
          Complaint: <strong>#{complaint.id} — {complaint.title}</strong>
        </p>
        <p style={modal.label}>Select reason for escalating to Admin:</p>
        <div style={modal.reasonList}>
          {reasons.map(r => (
            <div
              key={r}
              style={reason === r ? modal.reasonItemActive : modal.reasonItem}
              onClick={() => setReason(r)}
            >
              {reason === r ? '🔴' : '⚪'} {r}
            </div>
          ))}
        </div>
        {reason === 'Other (specify below)' && (
          <textarea
            style={modal.textarea}
            placeholder="Describe the reason..."
            onChange={e => setReason(e.target.value)}
            rows={3}
          />
        )}
        <div style={modal.btnRow}>
          <button style={modal.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={reason.trim() ? modal.confirmBtn : modal.confirmBtnDisabled}
            disabled={!reason.trim()}
            onClick={() => onConfirm(complaint.id, reason)}
          >
            🚨 Escalate to Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function HODDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [escalateTarget, setEscalateTarget] = useState(null);
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => { fetchComplaints(); }, []);

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

  const handleEscalate = async (id, reason) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/escalate`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEscalateTarget(null);
      setMessage('🚨 Complaint escalated to Admin!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error escalating complaint');
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status: 'RESOLVED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Complaint resolved!');
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error resolving complaint');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // HOD sees complaints at escalation level 2 (escalated by coordinator)
  const allComplaints = complaints; // backend already filters for HOD
  const pending = allComplaints.filter(c => c.status === 'ESCALATED');
  const inProgress = allComplaints.filter(c => c.status === 'IN_PROGRESS');
  const resolved = allComplaints.filter(c => c.status === 'RESOLVED');
  const sentToAdmin = allComplaints.filter(c => c.escalation_level >= 3);

  const tabs = [
    { id: 'all', label: '📋 All', count: allComplaints.length },
    { id: 'pending', label: '🔴 Pending', count: pending.length },
    { id: 'inprogress', label: '⏳ In Progress', count: inProgress.length },
    { id: 'resolved', label: '✅ Resolved', count: resolved.length },
    { id: 'admin', label: '🚨 Sent to Admin', count: sentToAdmin.length },
  ];

  const currentList = {
    all: allComplaints,
    pending: pending,
    inprogress: inProgress,
    resolved: resolved,
    admin: sentToAdmin,
  }[activeTab];

  return (
    <div style={styles.container}>
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
            <div style={styles.sidebarLogoSub}>HOD Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navLabel}>NAVIGATION</div>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>🏠 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate('/submit')}>➕ Submit Complaint</div>
        </nav>

        <div style={styles.sidebarStats}>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>Total Received</span>
            <span style={{ ...styles.sidebarStatValue, color: '#818cf8' }}>{allComplaints.length}</span>
          </div>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>Pending</span>
            <span style={{ ...styles.sidebarStatValue, color: '#f87171' }}>{pending.length}</span>
          </div>
          <div style={styles.sidebarStatItem}>
            <span style={styles.sidebarStatLabel}>Resolved</span>
            <span style={{ ...styles.sidebarStatValue, color: '#4ade80' }}>{resolved.length}</span>
          </div>
        </div>

        <div style={styles.sidebarUser}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.sidebarUserName}>{user?.name}</div>
            <div style={styles.sidebarUserRole}>Head of Department</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>🚪</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>HOD Dashboard</h1>
            <p style={styles.headerSub}>
              Department complaints escalated from Coordinator. Resolve or escalate to Admin.
            </p>
          </div>
          <button onClick={fetchComplaints} style={styles.refreshBtn}>⟳ Refresh</button>
        </div>

        {message && <div style={styles.messageBox}>{message}</div>}

        {/* STATS */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total', value: allComplaints.length, color: '#6366f1', bg: '#eef2ff', icon: '📋' },
            { label: 'Pending', value: pending.length, color: '#e11d48', bg: '#fff1f2', icon: '🔴' },
            { label: 'In Progress', value: inProgress.length, color: '#d97706', bg: '#fffbeb', icon: '⏳' },
            { label: 'Resolved', value: resolved.length, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
            { label: 'Sent to Admin', value: sentToAdmin.length, color: '#dc2626', bg: '#fef2f2', icon: '🚨' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: s.bg, color: s.color }}>{s.icon}</div>
              <div style={{ ...styles.statNumber, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* INFO BOX */}
        <div style={styles.infoBox}>
          <strong>ℹ️ Your Role:</strong> You receive complaints escalated by the Coordinator.
          You have authority to resolve department-level issues or escalate critical ones to the Admin.
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

        {/* TABLE */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : currentList.length === 0 ? (
            <div style={styles.center}>
              <div style={{ fontSize: '40px' }}>📭</div>
              <div style={{ color: '#6b7280', marginTop: '8px' }}>No complaints here</div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Escalation Level</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((c, i) => (
                  <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={styles.td}><span style={styles.idBadge}>#{c.id}</span></td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>
                      <div style={styles.ellipsis}>{c.title}</div>
                    </td>
                    <td style={styles.td}><span style={styles.catBadge}>{c.category_name || '—'}</span></td>
                    <td style={{ ...styles.td, color: '#6b7280' }}>{c.student_name}</td>
                    <td style={styles.td}>
                      <span style={getLevelStyle(c.escalation_level)}>
                        Level {c.escalation_level}
                      </span>
                    </td>
                    <td style={styles.td}><span style={getStatusStyle(c.status)}>{c.status}</span></td>
                    <td style={{ ...styles.td, color: '#9ca3af', fontSize: '12px', maxWidth: '150px' }}>
                      <div style={styles.ellipsis}>{c.escalation_reason || '—'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {c.status !== 'RESOLVED' && c.escalation_level < 3 && (
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
                              🚨 → Admin
                            </button>
                          </>
                        )}
                        {c.escalation_level >= 3 && (
                          <span style={styles.sentBadge}>🚨 Sent to Admin</span>
                        )}
                        {c.status === 'RESOLVED' && (
                          <span style={styles.resolvedBadge}>✅ Done</span>
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

function getLevelStyle(level) {
  const base = { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-block' };
  if (level >= 3) return { ...base, backgroundColor: '#fef2f2', color: '#dc2626' };
  if (level === 2) return { ...base, backgroundColor: '#faf5ff', color: '#9333ea' };
  return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: "'Segoe UI', Arial, sans-serif" },
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
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  main: { marginLeft: '240px', flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  headerSub: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  refreshBtn: { padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  messageBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', color: '#16a34a', fontSize: '14px', marginBottom: '20px', fontWeight: '500' },
  infoBox: { backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', color: '#92400e', fontSize: '13px', marginBottom: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' },
  statNumber: { fontSize: '28px', fontWeight: '800', lineHeight: 1, marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280' },
  tabRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  tab: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #4f46e5', backgroundColor: '#4f46e5', cursor: 'pointer', fontSize: '13px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  tabBadge: { backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f9fafb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f3f4f6' },
  idBadge: { color: '#94a3b8', fontSize: '12px', fontWeight: '600' },
  catBadge: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' },
  center: { padding: '60px', textAlign: 'center' },
  actionRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  resolveBtn: { padding: '5px 12px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  escalateBtn: { padding: '5px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  sentBadge: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  resolvedBadge: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
};

const modal = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' },
  title: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' },
  reasonList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  reasonItem: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '13px', color: '#374151' },
  reasonItemActive: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #dc2626', backgroundColor: '#fef2f2', cursor: 'pointer', fontSize: '13px', color: '#dc2626', fontWeight: '600' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  btnRow: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmBtn: { padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmBtnDisabled: { padding: '10px 20px', backgroundColor: '#d1d5db', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },
};

export default HODDashboard;
