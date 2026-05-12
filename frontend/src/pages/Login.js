import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, TrendingUp, Users } from 'lucide-react';

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
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email, password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>
            <Shield size={40} color="white" />
            <span style={styles.logoText}>EduResolve</span>
          </div>
          <h1 style={styles.tagline}>Your voice shapes<br />campus life.</h1>
          <p style={styles.taglineSubtext}>
            Submit complaints, track their progress, and help build
            a better campus community together.
          </p>
          <div style={styles.features}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <BookOpen size={20} color="#818cf8" />
              </div>
              <div>
                <div style={styles.featureTitle}>Submit & Track</div>
                <div style={styles.featureDesc}>Lodge complaints and monitor real-time status updates</div>
              </div>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <TrendingUp size={20} color="#818cf8" />
              </div>
              <div>
                <div style={styles.featureTitle}>Community Upvotes</div>
                <div style={styles.featureDesc}>Amplify important issues with collective support</div>
              </div>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <Users size={20} color="#818cf8" />
              </div>
              <div>
                <div style={styles.featureTitle}>Transparent Resolution</div>
                <div style={styles.featureDesc}>See how and when complaints get resolved</div>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.leftFooter}>
          2026 EduResolve · All rights reserved
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <h2 style={styles.welcomeText}>Welcome back</h2>
          <p style={styles.welcomeSubtext}>Sign in to your account</p>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@college.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={loading ? styles.buttonLoading : styles.button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={styles.demoAccounts}>
            <p style={styles.demoTitle}>Demo Accounts (password: password)</p>
            <div style={styles.demoGrid}>
              {[
                { role: 'Admin', email: 'admin@college.com' },
                { role: 'Student', email: 'student@college.com' },
                { role: 'Staff', email: 'staff@college.com' },
                { role: 'HOD', email: 'hod@college.com' },
              ].map(acc => (
                <div
                  key={acc.role}
                  style={styles.demoChip}
                  onClick={() => { setEmail(acc.email); setPassword('password'); }}
                >
                  <span style={styles.demoRole}>{acc.role}</span>
                  <span style={styles.demoEmail}>{acc.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '50px',
    color: 'white',
  },
  leftContent: { maxWidth: '480px' },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '60px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  tagline: {
    fontSize: '42px',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: 'white',
  },
  taglineSubtext: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.6',
    marginBottom: '50px',
  },
  features: { display: 'flex', flexDirection: 'column', gap: '25px' },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: '15px' },
  featureIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '10px',
    padding: '10px',
    flexShrink: 0,
  },
  featureTitle: { fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' },
  featureDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  leftFooter: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  rightPanel: {
    flex: 1,
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formBox: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  welcomeText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  welcomeSubtext: { fontSize: '15px', color: '#64748b', marginBottom: '32px' },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '20px',
  },
  inputGroup: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px',
    color: '#1e293b',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonLoading: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#818cf8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '8px',
  },
  demoAccounts: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #f1f5f9',
  },
  demoTitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '12px',
    textAlign: 'center',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  demoChip: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  demoRole: { fontSize: '12px', fontWeight: '600', color: '#4f46e5' },
  demoEmail: { fontSize: '11px', color: '#94a3b8' },
};

export default Login;