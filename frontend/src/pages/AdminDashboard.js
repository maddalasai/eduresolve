import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  // Fetch users when the users tab is opened
  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0) {
      setUsersLoading(true);
      axios.get('http://localhost:5000/api/complaints/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setAllUsers(res.data);
        setUsersLoading(false);
      }).catch(() => setUsersLoading(false));
    }
  }, [activeTab]);

  const fetchAll = async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/complaints/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setComplaints(cRes.data);
      setAnalytics(aRes.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) { console.error(err); }
  };

  const statusBadge = (status) => {
    const b = { padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'inline-block', letterSpacing: '0.4px' };
    switch (status) {
      case 'OPEN':        return { ...b, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
      case 'IN_PROGRESS': return { ...b, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' };
      case 'RESOLVED':    return { ...b, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
      case 'ESCALATED':   return { ...b, backgroundColor: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' };
      default:            return { ...b, backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const priorityBadge = (score) => {
    const b = { padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'inline-block' };
    if (score >= 25) return { ...b, backgroundColor: '#fef2f2', color: '#b91c1c' };
    if (score >= 15) return { ...b, backgroundColor: '#fffbeb', color: '#92400e' };
    return { ...b, backgroundColor: '#f0fdf4', color: '#166534' };
  };

  const stats   = analytics?.stats || {};
  const byCat   = analytics?.byCategory || [];
  const total   = parseInt(stats.total) || 0;
  const open    = parseInt(stats.open) || 0;
  const inProg  = parseInt(stats.in_progress) || 0;
  const resolved= parseInt(stats.resolved) || 0;
  const escalated=parseInt(stats.escalated) || 0;
  const rate    = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const filtered = statusFilter === 'ALL' ? complaints : complaints.filter(c => c.status === statusFilter);
  const recent   = complaints.slice(0, 6);
  const topVoted = [...complaints].sort((a,b) => (b.upvote_count||0)-(a.upvote_count||0)).slice(0,5);

  // ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div>
      {/* Stat cards */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total',       value: total,    color: '#1d4ed8', sub: 'All time'              },
          { label: 'Open',        value: open,     color: '#b91c1c', sub: `${total>0?Math.round(open/total*100):0}% of total` },
          { label: 'In Progress', value: inProg,   color: '#92400e', sub: 'Being handled'         },
          { label: 'Resolved',    value: resolved, color: '#166534', sub: `${rate}% resolution`   },
          { label: 'Escalated',   value: escalated,color: '#6b21a8', sub: 'Needs attention'       },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={s.statTop}>
              <span style={s.statLabel}>{st.label}</span>
              <span style={s.statSub}>{st.sub}</span>
            </div>
            <div style={{ ...s.statVal, color: st.color }}>{st.value}</div>
            <div style={s.statBar}>
              <div style={{ ...s.statBarFill, width: `${total>0?Math.min(st.value/total*100,100):0}%`, backgroundColor: st.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div style={s.midRow}>
        {/* Resolution summary */}
        <div style={{ ...s.panel, width: '200px', flexShrink: 0, alignItems: 'center', textAlign: 'center' }}>
          <div style={s.panelTitle}>Resolution Rate</div>
          <div style={{ ...s.bigNum, color: '#166534', margin: '20px 0 4px' }}>{rate}%</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>of all complaints resolved</div>
          <div style={s.rateBarWrap}>
            <div style={{ ...s.rateBarFill, width: `${rate}%` }} />
          </div>
          <div style={s.rateRow}>
            <div><div style={{ color: '#166534', fontWeight: '700' }}>{resolved}</div><div style={s.rateLabel}>Resolved</div></div>
            <div style={s.rateDivider} />
            <div><div style={{ color: '#b91c1c', fontWeight: '700' }}>{open}</div><div style={s.rateLabel}>Pending</div></div>
          </div>
        </div>

        {/* Category breakdown */}
        <div style={{ ...s.panel, flex: 2 }}>
          <div style={s.panelTitle}>Complaints by Category</div>
          <div style={{ marginTop: '16px' }}>
            {byCat.length === 0
              ? <div style={s.empty}>No data yet</div>
              : byCat.slice(0,6).map((cat, i) => {
                  const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                  return (
                    <div key={i} style={s.catRow}>
                      <div style={s.catName}>{cat.name || 'Uncategorized'}</div>
                      <div style={s.catBarWrap}>
                        <div style={{ ...s.catBarFill, width: `${pct}%` }} />
                      </div>
                      <div style={s.catPct}>{pct}%</div>
                      <div style={s.catCount}>{cat.count}</div>
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Top upvoted */}
        <div style={{ ...s.panel, flex: 1.2 }}>
          <div style={s.panelTitle}>Most Upvoted</div>
          <div style={{ marginTop: '12px' }}>
            {topVoted.length === 0
              ? <div style={s.empty}>No upvotes yet</div>
              : topVoted.map((c, i) => (
                <div key={c.id} style={s.upvoteRow}>
                  <div style={s.upvoteRank}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.upvoteTitle}>{c.title}</div>
                    <div style={s.upvoteCat}>{c.category_name}</div>
                  </div>
                  <div style={s.upvoteCount}>{c.upvote_count || 0}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <div style={s.panelTitle}>Recent Activity</div>
          <button style={s.linkBtn} onClick={() => setActiveTab('complaints')}>View all</button>
        </div>
        <table style={s.table}>
          <thead><tr style={s.thead}>
            {['ID','Title','Category','Student','Status','Upvotes','Date'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {recent.map((c,i) => (
              <tr key={c.id} style={i%2===0?s.trEven:s.trOdd}>
                <td style={s.td}><span style={s.idTag}>#{c.id}</span></td>
                <td style={{ ...s.td, maxWidth: '200px' }}><div style={s.ellipsis}>{c.title}</div></td>
                <td style={s.td}><span style={s.catTag}>{c.category_name||'—'}</span></td>
                <td style={{ ...s.td, color: '#64748b' }}>{c.student_name}</td>
                <td style={s.td}><span style={statusBadge(c.status)}>{c.status.replace('_',' ')}</span></td>
                <td style={{ ...s.td, textAlign: 'center', color: '#64748b' }}>{c.upvote_count||0}</td>
                <td style={{ ...s.td, color: '#94a3b8', fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary strip */}
      <div style={s.summaryStrip}>
        {[
          { label: 'Open — needs attention',    value: open,     color: '#b91c1c' },
          { label: 'In progress',               value: inProg,   color: '#92400e' },
          { label: 'Escalated — review needed', value: escalated,color: '#6b21a8' },
        ].map(st => (
          <div key={st.label} style={{ ...s.summaryCard, borderLeftColor: st.color }}>
            <div style={{ ...s.summaryVal, color: st.color }}>{st.value}</div>
            <div style={s.summaryLabel}>{st.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── COMPLAINTS TAB ────────────────────────────────────────────────────────────
  const renderComplaints = () => (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <div style={s.panelTitle}>All Complaints ({filtered.length})</div>
        <div style={s.filterRow}>
          {['ALL','OPEN','IN_PROGRESS','RESOLVED','ESCALATED'].map(f => (
            <button key={f} style={statusFilter===f ? s.filterBtnActive : s.filterBtn}
              onClick={() => setStatusFilter(f)}>
              {f === 'IN_PROGRESS' ? 'IN PROGRESS' : f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead><tr style={s.thead}>
            {['ID','Title','Category','Student','Status','Upvotes','Priority','Update','Date'].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((c,i) => (
              <tr key={c.id} style={i%2===0?s.trEven:s.trOdd}>
                <td style={s.td}><span style={s.idTag}>#{c.id}</span></td>
                <td style={{ ...s.td, maxWidth: '180px' }}><div style={s.ellipsis}>{c.title}</div></td>
                <td style={s.td}><span style={s.catTag}>{c.category_name||'—'}</span></td>
                <td style={{ ...s.td, color: '#64748b' }}>{c.student_name}</td>
                <td style={s.td}><span style={statusBadge(c.status)}>{c.status.replace('_',' ')}</span></td>
                <td style={{ ...s.td, textAlign: 'center', color: '#64748b' }}>{c.upvote_count||0}</td>
                <td style={{ ...s.td, textAlign: 'center' }}><span style={priorityBadge(c.priority_score)}>{c.priority_score||0}</span></td>
                <td style={s.td}>
                  <select value={c.status} onChange={e => handleStatusUpdate(c.id, e.target.value)} style={s.select}>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="ESCALATED">Escalated</option>
                  </select>
                </td>
                <td style={{ ...s.td, color: '#94a3b8', fontSize: '12px' }}>{new Date(c.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── USERS TAB ─────────────────────────────────────────────────────────────────
  const renderUsers = () => {
    const roleColors = {
      ADMIN: '#1e3a5f', STUDENT: '#166534', SUPPORT_STAFF: '#92400e',
      HOD: '#7f1d1d', COORDINATOR: '#4c1d95', WARDEN: '#0c4a6e',
      HOSTEL_MANAGER: '#831843', LIBRARIAN: '#3b0764', TRANSPORT_MANAGER: '#164e63',
    };

    return (
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <div style={s.panelTitle}>All Registered Users ({allUsers.length})</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>All users in the system with their roles and complaint counts</div>
        </div>
        {usersLoading ? (
          <div style={s.center}>Loading users...</div>
        ) : (
          <table style={s.table}>
            <thead><tr style={s.thead}>
              {['User', 'Email', 'Role', 'Complaints'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {allUsers.map((u, i) => (
                <tr key={u.id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ ...s.avatar, backgroundColor: roleColors[u.role] || '#1e3a5f' }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '500' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: '#64748b' }}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
                      fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569',
                    }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={s.td}><span style={s.catTag}>{u.complaint_count || 0}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandMark}>E</div>
          <div>
            <div style={s.brandName}>EduResolve</div>
            <div style={s.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={s.nav}>
          <div style={s.navSection}>MAIN MENU</div>
          {[
            { id: 'overview',   label: 'Overview'          },
            { id: 'complaints', label: 'All Complaints', badge: open },
            { id: 'users',      label: 'Users'             },
          ].map(item => (
            <div key={item.id}
              style={activeTab===item.id ? { ...s.navItem, ...s.navActive } : s.navItem}
              onClick={() => setActiveTab(item.id)}>
              {item.label}
              {item.badge > 0 && <span style={s.navBadge}>{item.badge}</span>}
            </div>
          ))}
          <div style={{ ...s.navSection, marginTop: '16px' }}>ACTIONS</div>
          <div style={s.navItem} onClick={() => navigate('/submit')}>New Complaint</div>
        </nav>

        <div style={s.sideStats}>
          <div style={s.sideStatRow}>
            <span style={s.sideStatLabel}>Resolution Rate</span>
            <span style={{ ...s.sideStatVal, color: '#4ade80' }}>{rate}%</span>
          </div>
          <div style={s.sideBar}><div style={{ width:`${rate}%`, height:'100%', backgroundColor:'#4ade80', borderRadius:'2px' }}/></div>
          <div style={{ ...s.sideStatRow, marginTop:'8px' }}>
            <span style={s.sideStatLabel}>Escalated</span>
            <span style={{ ...s.sideStatVal, color:'#f87171' }}>{escalated}</span>
          </div>
        </div>

        <div style={s.sideUser}>
          <div style={s.sideAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={s.sideUserName}>{user?.name}</div>
            <div style={s.sideUserRole}>Administrator</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={s.logoutBtn}>↩</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab==='overview' && 'Dashboard Overview'}
              {activeTab==='complaints' && 'Complaints Management'}
              {activeTab==='users' && 'User Management'}
            </h1>
            <div style={s.breadcrumb}>Admin · {activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}</div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <span style={s.dateTag}>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
            <button onClick={fetchAll} style={s.refreshBtn}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={s.center}>Loading dashboard...</div>
        ) : (
          <>
            {activeTab==='overview'    && renderOverview()}
            {activeTab==='complaints'  && renderComplaints()}
            {activeTab==='users'       && renderUsers()}
          </>
        )}
      </main>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  shell:    { display:'flex', minHeight:'100vh', backgroundColor:'#f1f5f9', fontFamily:"'Segoe UI', Arial, sans-serif" },

  // Sidebar
  sidebar:  { width:'220px', backgroundColor:'#0f2744', display:'flex', flexDirection:'column', position:'fixed', height:'100vh', top:0, left:0 },
  brand:    { display:'flex', alignItems:'center', gap:'10px', padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  brandMark:{ width:'32px', height:'32px', borderRadius:'6px', backgroundColor:'#2563eb', color:'white', fontWeight:'800', fontSize:'17px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  brandName:{ color:'white', fontWeight:'700', fontSize:'14px' },
  brandSub: { color:'rgba(255,255,255,0.35)', fontSize:'10px', marginTop:'1px' },
  nav:      { flex:1, padding:'12px 10px', overflowY:'auto' },
  navSection:{ color:'rgba(255,255,255,0.3)', fontSize:'10px', fontWeight:'700', letterSpacing:'1.2px', padding:'8px 10px 4px' },
  navItem:  { color:'rgba(255,255,255,0.6)', padding:'9px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'13px', marginBottom:'2px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navActive: { backgroundColor:'rgba(37,99,235,0.2)', color:'white', fontWeight:'600', borderLeft:'3px solid #2563eb' },
  navBadge: { backgroundColor:'#b91c1c', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'10px', fontWeight:'700' },
  sideStats:{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  sideStatRow:{ display:'flex', justifyContent:'space-between', alignItems:'center' },
  sideStatLabel:{ color:'rgba(255,255,255,0.4)', fontSize:'11px' },
  sideStatVal:{ fontWeight:'700', fontSize:'12px' },
  sideBar:  { height:'3px', backgroundColor:'rgba(255,255,255,0.1)', borderRadius:'2px', marginTop:'5px', overflow:'hidden' },
  sideUser: { display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px' },
  sideAvatar:{ width:'30px', height:'30px', borderRadius:'50%', backgroundColor:'#2563eb', color:'white', fontWeight:'700', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  sideUserName:{ color:'white', fontSize:'12px', fontWeight:'600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  sideUserRole:{ color:'rgba(255,255,255,0.35)', fontSize:'10px' },
  logoutBtn:{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'15px', padding:'4px' },

  // Main
  main:     { marginLeft:'220px', flex:1, padding:'26px 30px' },
  topbar:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', paddingBottom:'18px', borderBottom:'1px solid #e2e8f0' },
  pageTitle:{ fontSize:'20px', fontWeight:'700', color:'#0f172a', margin:0 },
  breadcrumb:{ fontSize:'12px', color:'#94a3b8', marginTop:'3px' },
  dateTag:  { backgroundColor:'white', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'7px 12px', fontSize:'12px', color:'#475569' },
  refreshBtn:{ backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },

  // Stat cards
  statsGrid:{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px', marginBottom:'18px' },
  statCard: { backgroundColor:'white', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0' },
  statTop:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' },
  statLabel:{ fontSize:'11px', fontWeight:'600', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' },
  statSub:  { fontSize:'10px', color:'#94a3b8', textAlign:'right', maxWidth:'80px' },
  statVal:  { fontSize:'28px', fontWeight:'800', lineHeight:1, marginBottom:'10px' },
  statBar:  { height:'3px', backgroundColor:'#f1f5f9', borderRadius:'2px', overflow:'hidden' },
  statBarFill:{ height:'100%', borderRadius:'2px', transition:'width 0.8s ease' },

  // Mid row
  midRow:   { display:'flex', gap:'14px', marginBottom:'18px' },
  panel:    { backgroundColor:'white', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'18px', marginBottom:'18px' },
  panelHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' },
  panelTitle:{ fontSize:'13px', fontWeight:'700', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.5px' },
  linkBtn:  { fontSize:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:'600' },
  bigNum:   { fontSize:'40px', fontWeight:'800', lineHeight:1 },
  rateBarWrap:{ width:'100%', height:'6px', backgroundColor:'#f1f5f9', borderRadius:'3px', overflow:'hidden', marginBottom:'16px' },
  rateBarFill:{ height:'100%', backgroundColor:'#166534', borderRadius:'3px', transition:'width 0.8s ease' },
  rateRow:  { display:'flex', gap:'20px', alignItems:'center', justifyContent:'center' },
  rateLabel:{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' },
  rateDivider:{ width:'1px', height:'28px', backgroundColor:'#e2e8f0' },

  // Category
  catRow:   { display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' },
  catName:  { fontSize:'12px', color:'#374151', width:'110px', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  catBarWrap:{ flex:1, backgroundColor:'#f1f5f9', borderRadius:'3px', height:'5px', overflow:'hidden' },
  catBarFill:{ height:'100%', backgroundColor:'#1d4ed8', borderRadius:'3px', transition:'width 0.8s ease', minWidth:'3px' },
  catPct:   { fontSize:'11px', color:'#64748b', width:'30px', textAlign:'right' },
  catCount: { fontSize:'11px', fontWeight:'700', color:'#374151', width:'20px', textAlign:'right' },

  // Top upvoted
  upvoteRow:{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 0', borderBottom:'1px solid #f1f5f9' },
  upvoteRank:{ width:'20px', height:'20px', borderRadius:'4px', backgroundColor:'#f1f5f9', color:'#475569', fontSize:'11px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  upvoteTitle:{ fontSize:'12px', fontWeight:'600', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  upvoteCat:{ fontSize:'10px', color:'#94a3b8', marginTop:'1px' },
  upvoteCount:{ fontSize:'12px', fontWeight:'700', color:'#1d4ed8', flexShrink:0 },

  // Summary strip
  summaryStrip:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'18px' },
  summaryCard:{ backgroundColor:'white', border:'1px solid #e2e8f0', borderLeft:'4px solid #e2e8f0', borderRadius:'8px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px' },
  summaryVal: { fontSize:'24px', fontWeight:'800' },
  summaryLabel:{ fontSize:'12px', color:'#64748b' },

  // Filter
  filterRow:{ display:'flex', gap:'6px' },
  filterBtn:{ padding:'5px 12px', borderRadius:'4px', border:'1px solid #e2e8f0', backgroundColor:'white', cursor:'pointer', fontSize:'11px', fontWeight:'600', color:'#64748b' },
  filterBtnActive:{ padding:'5px 12px', borderRadius:'4px', border:'1px solid #1e3a5f', backgroundColor:'#1e3a5f', cursor:'pointer', fontSize:'11px', fontWeight:'600', color:'white' },

  // Table
  table:    { width:'100%', borderCollapse:'collapse' },
  thead:    { backgroundColor:'#f8fafc' },
  th:       { padding:'10px 14px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:'1px solid #e2e8f0' },
  trEven:   { backgroundColor:'white' },
  trOdd:    { backgroundColor:'#fafafa' },
  td:       { padding:'11px 14px', fontSize:'13px', color:'#1e293b', borderBottom:'1px solid #f1f5f9' },
  idTag:    { color:'#94a3b8', fontSize:'11px', fontWeight:'600', fontFamily:'monospace' },
  catTag:   { backgroundColor:'#eff6ff', color:'#1d4ed8', padding:'2px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600' },
  ellipsis: { overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  select:   { padding:'4px 8px', borderRadius:'4px', border:'1px solid #cbd5e1', fontSize:'11px', backgroundColor:'white', cursor:'pointer', color:'#374151' },
  avatar:   { width:'28px', height:'28px', borderRadius:'50%', backgroundColor:'#1e3a5f', color:'white', fontWeight:'700', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  center:   { padding:'60px', textAlign:'center', color:'#64748b' },
  empty:    { color:'#94a3b8', textAlign:'center', padding:'20px', fontSize:'13px' },
};

export default AdminDashboard;
