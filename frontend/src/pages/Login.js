import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const staffAccounts = [
    { role: 'Admin',         email: 'admin@college.com',         color: '#1e3a5f' },
    { role: 'Support Staff', email: 'staff@college.com',         color: '#92400e' },
    { role: 'HOD',           email: 'hod@college.com',           color: '#7f1d1d' },
    { role: 'Coordinator',   email: 'coordinator@college.com',   color: '#4c1d95' },
    { role: 'Warden',        email: 'warden@college.com',        color: '#0c4a6e' },
    { role: 'Hostel Mgr',    email: 'hostelmanager@college.com', color: '#831843' },
    { role: 'Librarian',     email: 'librarian@college.com',     color: '#3b0764' },
    { role: 'Transport',     email: 'transport@college.com',     color: '#164e63' },
  ];

  const studentAccounts = [
    { role: 'Student',  email: 'student@college.com' },
    { role: 'Priya',    email: 'priya@college.com'   },
    { role: 'Rahul',    email: 'rahul@college.com'   },
    { role: 'Anjali',   email: 'anjali@college.com'  },
    { role: 'Kiran',    email: 'kiran@college.com'   },
    { role: 'Sneha',    email: 'sneha@college.com'   },
    { role: 'Arjun',    email: 'arjun@college.com'   },
    { role: 'Divya',    email: 'divya@college.com'   },
    { role: 'Vikram',   email: 'vikram@college.com'  },
    { role: 'Meera',    email: 'meera@college.com'   },
    { role: 'Rohit',    email: 'rohit@college.com'   },
  ];

  return (
    <div style={s.page}>
      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        {/* Top bar */}
        <div style={s.leftTop}>
          <div style={s.logoMark}>E</div>
          <span style={s.logoName}>EduResolve</span>
        </div>

        {/* Centre content */}
        <div style={s.leftBody}>
          <h1 style={s.headline}>Online Complaint<br />Management System</h1>
          <p style={s.sub}>
            A transparent, role-based platform for students to raise
            campus issues and for staff to resolve them efficiently.
          </p>

          <div style={s.pillRow}>
            {['Submit Complaints','Track Progress','Upvote Issues','Escalation Workflow'].map(t => (
              <span key={t} style={s.pill}>{t}</span>
            ))}
          </div>

          <div style={s.featureList}>
            {[
              { title: 'Role-Based Access', desc: '8 distinct roles — each sees only what they need' },
              { title: 'Smart Escalation', desc: 'Complaints auto-escalate through 3 levels if unresolved' },
              { title: 'Priority Scoring', desc: 'Upvotes + category weight + age determine urgency' },
            ].map(f => (
              <div key={f.title} style={s.featureItem}>
                <div style={s.featureDot} />
                <div>
                  <div style={s.featureTitle}>{f.title}</div>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.leftFoot}>
          © 2026 EduResolve
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHead}>
            <div style={s.cardTitle}>Sign in to your account</div>
            <div style={s.cardSub}>Use your institutional email address</div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleLogin} style={{ marginBottom: '24px' }}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                placeholder="yourname@college.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={loading ? s.btnDisabled : s.btn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={s.demoSection}>
            <div style={s.demoHeading}>
              <div style={s.demoDivider}/>
              <span style={s.demoLabel}>Demo Accounts — click to fill</span>
              <div style={s.demoDivider}/>
            </div>

            <div style={s.demoGroup}>
              <div style={s.demoGroupLabel}>STAFF</div>
              <div style={s.chipGrid}>
                {staffAccounts.map(a => (
                  <button key={a.role} style={s.chip}
                    onClick={() => { setEmail(a.email); setPassword('password'); }}>
                    <span style={{ ...s.chipRole, color: a.color }}>{a.role}</span>
                    <span style={s.chipEmail}>{a.email.split('@')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...s.demoGroup, marginTop: '12px' }}>
              <div style={s.demoGroupLabel}>STUDENTS</div>
              <div style={s.chipGrid}>
                {studentAccounts.map(a => (
                  <button key={a.role} style={s.chip}
                    onClick={() => { setEmail(a.email); setPassword('password'); }}>
                    <span style={{ ...s.chipRole, color: '#065f46' }}>{a.role}</span>
                    <span style={s.chipEmail}>{a.email.split('@')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={s.passwordNote}>All demo accounts use password: <strong>password</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
    backgroundColor: '#f1f5f9',
  },

  // ── LEFT ──
  left: {
    width: '420px',
    flexShrink: 0,
    backgroundColor: '#0f2744',
    display: 'flex',
    flexDirection: 'column',
    padding: '36px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '60px',
  },
  logoMark: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: '800',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: {
    color: 'white',
    fontWeight: '700',
    fontSize: '18px',
    letterSpacing: '0.3px',
  },
  leftBody: { flex: 1 },
  collegeBadge: { display: 'none' },
  statRow: { display: 'none' },
  statBox: {},
  statNum: {},
  statLbl: {},
  statDivider: {},
  featureList: { display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '8px' },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', marginTop: '6px', flexShrink: 0 },
  featureTitle: { color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '600', marginBottom: '2px' },
  featureDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.5' },
  headline: {
    color: 'white',
    fontSize: '30px',
    fontWeight: '700',
    lineHeight: '1.25',
    marginBottom: '16px',
    letterSpacing: '-0.3px',
  },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '40px',
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    padding: '5px 12px',
    borderRadius: '4px',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '16px 0',
  },
  statBox: { flex: 1, textAlign: 'center' },
  statNum: { color: 'white', fontSize: '24px', fontWeight: '700' },
  statLbl: { color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '2px' },
  statDivider: { width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.1)' },
  leftFoot: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    marginTop: '32px',
  },

  // ── RIGHT ──
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 32px',
    overflowY: 'auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '36px 40px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardHead: { marginBottom: '28px' },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  cardSub: { fontSize: '14px', color: '#64748b' },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#b91c1c',
    fontSize: '13px',
    marginBottom: '20px',
  },
  field: { marginBottom: '18px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    letterSpacing: '0.2px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1.5px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  btn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1e3a5f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    marginTop: '4px',
  },
  btnDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '4px',
  },

  // ── DEMO ACCOUNTS ──
  demoSection: { borderTop: '1px solid #e2e8f0', paddingTop: '20px' },
  demoHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  demoDivider: { flex: 1, height: '1px', backgroundColor: '#e2e8f0' },
  demoLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  demoGroup: {},
  demoGroupLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  chipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  chip: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '7px 8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    textAlign: 'left',
  },
  chipRole: { fontSize: '11px', fontWeight: '700', lineHeight: 1 },
  chipEmail: { fontSize: '10px', color: '#94a3b8', lineHeight: 1 },
  passwordNote: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '14px',
  },
};

export default Login;
