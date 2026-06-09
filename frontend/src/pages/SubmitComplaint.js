import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SubmitComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Duplicate detection state
  // When backend returns 409, we store the existing complaint here
  const [duplicate, setDuplicate] = useState(null);
  const [similarityPercent, setSimilarityPercent] = useState(0);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [upvoteError, setUpvoteError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicate(null);
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5000/api/complaints',
        { title, description, category_id: categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        // Duplicate detected — show the existing complaint
        // The backend used PostgreSQL's SIMILARITY() function to find this
        const data = err.response.data;
        setDuplicate(data.existingComplaint);
        setSimilarityPercent(data.similarityPercent || 0);
        setUpvoteCount(data.existingComplaint?.upvote_count || 0);
      } else {
        setError(err.response?.data?.error || 'Failed to submit complaint');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upvote the existing duplicate complaint
  const handleUpvote = async () => {
    setUpvoteLoading(true);
    setUpvoteError('');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/complaints/${duplicate.id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpvoted(true);
      setUpvoteCount(res.data.upvote_count);
    } catch (err) {
      setUpvoteError(err.response?.data?.error || 'Could not upvote');
    } finally {
      setUpvoteLoading(false);
    }
  };

  const handleReset = () => {
    setDuplicate(null);
    setSimilarityPercent(0);
    setUpvoted(false);
    setUpvoteError('');
    setError('');
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successTitle}>Complaint Submitted</h2>
          <p style={s.successSub}>
            Your complaint has been logged and routed to the appropriate authority.
          </p>
          <div style={s.btnRow}>
            <button style={s.primaryBtn} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button style={s.secondaryBtn} onClick={() => {
              setSubmitted(false);
              setTitle(''); setDescription(''); setCategoryId('');
            }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DUPLICATE DETECTED STATE ───────────────────────────────────────────────
  // This is the key feature from the sequence diagram:
  // "If a similar complaint exists, the student is given an option to upvote it"
  if (duplicate) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          {/* Similarity indicator */}
          <div style={s.dupHeader}>
            <div style={s.dupBadge}>
              Similar complaint found
            </div>
            <div style={s.simScore}>
              <div style={s.simLabel}>Similarity</div>
              <div style={s.simBar}>
                <div style={{ ...s.simBarFill, width: `${similarityPercent}%` }} />
              </div>
              <div style={s.simPct}>{similarityPercent}%</div>
            </div>
          </div>

          <p style={s.dupExplain}>
            PostgreSQL's <code style={s.code}>SIMILARITY()</code> function detected
            a <strong>{similarityPercent}% match</strong> with an existing complaint.
            Instead of creating a duplicate, you can upvote the existing one to
            increase its priority score.
          </p>

          {/* Existing complaint card */}
          <div style={s.existingCard}>
            <div style={s.existingTop}>
              <span style={s.existingId}>#{duplicate.id}</span>
              <span style={statusBadge(duplicate.status)}>{duplicate.status.replace('_', ' ')}</span>
            </div>
            <div style={s.existingTitle}>{duplicate.title}</div>
            <div style={s.existingDesc}>{duplicate.description}</div>
            <div style={s.existingMeta}>
              Submitted {new Date(duplicate.created_at).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </div>
          </div>

          {/* Upvote section */}
          <div style={s.upvoteSection}>
            <div style={s.upvoteInfo}>
              <span style={s.upvoteCount}>{upvoteCount}</span>
              <span style={s.upvoteLabel}>
                {upvoteCount === 1 ? 'student has' : 'students have'} upvoted this
              </span>
            </div>

            {upvoted ? (
              <div style={s.upvotedMsg}>
                You upvoted this complaint. Its priority score has been updated.
              </div>
            ) : (
              <button
                style={upvoteLoading ? s.upvoteBtnLoading : s.upvoteBtn}
                onClick={handleUpvote}
                disabled={upvoteLoading}
              >
                {upvoteLoading ? 'Upvoting...' : 'Upvote this complaint'}
              </button>
            )}

            {upvoteError && (
              <div style={s.upvoteErr}>{upvoteError}</div>
            )}
          </div>

          {/* Actions */}
          <div style={s.dupActions}>
            <button style={s.secondaryBtn} onClick={handleReset}>
              Edit my complaint
            </button>
            <button style={s.ghostBtn} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardHead}>
          <button style={s.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h1 style={s.cardTitle}>Submit a Complaint</h1>
          <p style={s.cardSub}>
            Describe your issue clearly. The system will check for similar
            existing complaints using PostgreSQL text similarity.
          </p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Complaint Title</label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. Lights not working in Room 204"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Category</label>
            <select
              style={s.input}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, height: '130px', resize: 'vertical' }}
              placeholder="Describe the issue in detail — location, how long it has been happening, impact on students..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <div style={s.charCount}>{description.length} characters</div>
          </div>

          <div style={s.infoBox}>
            The system uses PostgreSQL's built-in <code style={s.code}>SIMILARITY()</code> function
            to detect duplicate complaints. If a similar complaint already exists,
            you will be shown the existing one and given the option to upvote it instead.
          </div>

          <button
            type="submit"
            style={loading ? s.submitBtnLoading : s.submitBtn}
            disabled={loading}
          >
            {loading ? 'Checking for duplicates...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}

function statusBadge(status) {
  const base = {
    padding: '3px 10px', borderRadius: '4px',
    fontSize: '11px', fontWeight: '700', display: 'inline-block'
  };
  switch (status) {
    case 'OPEN':        return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
    case 'IN_PROGRESS': return { ...base, backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' };
    case 'RESOLVED':    return { ...base, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
    case 'ESCALATED':   return { ...base, backgroundColor: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' };
    default:            return { ...base, backgroundColor: '#f1f5f9', color: '#475569' };
  }
}

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '36px 40px',
    width: '100%',
    maxWidth: '580px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardHead: { marginBottom: '28px' },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#64748b', fontSize: '13px', padding: '0 0 12px 0',
    display: 'block',
  },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' },
  cardSub: { fontSize: '13px', color: '#64748b', margin: 0 },
  errorBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '6px', padding: '10px 14px',
    color: '#b91c1c', fontSize: '13px', marginBottom: '20px',
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1.5px solid #cbd5e1', fontSize: '14px', color: '#0f172a',
    boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc',
    fontFamily: 'inherit',
  },
  charCount: { fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' },
  infoBox: {
    backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
    borderRadius: '6px', padding: '12px 14px',
    color: '#0369a1', fontSize: '12px', marginBottom: '20px', lineHeight: '1.6',
  },
  code: {
    backgroundColor: '#e0f2fe', padding: '1px 5px',
    borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px',
  },
  submitBtn: {
    width: '100%', padding: '12px', backgroundColor: '#1e3a5f',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  submitBtnLoading: {
    width: '100%', padding: '12px', backgroundColor: '#94a3b8',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '14px', fontWeight: '600', cursor: 'not-allowed',
  },

  // Success
  successIcon: {
    width: '56px', height: '56px', borderRadius: '50%',
    backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0',
    color: '#166534', fontSize: '24px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', textAlign: 'center', margin: '0 0 8px' },
  successSub: { fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '28px' },
  btnRow: { display: 'flex', gap: '12px' },
  primaryBtn: {
    flex: 1, padding: '11px', backgroundColor: '#1e3a5f',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  secondaryBtn: {
    flex: 1, padding: '11px', backgroundColor: 'white',
    color: '#374151', border: '1px solid #e2e8f0', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  ghostBtn: {
    flex: 1, padding: '11px', backgroundColor: 'transparent',
    color: '#64748b', border: 'none', borderRadius: '6px',
    fontSize: '13px', cursor: 'pointer',
  },

  // Duplicate
  dupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  dupBadge: {
    backgroundColor: '#fffbeb', border: '1px solid #fde68a',
    color: '#92400e', fontSize: '12px', fontWeight: '700',
    padding: '5px 12px', borderRadius: '4px',
  },
  simScore: { display: 'flex', alignItems: 'center', gap: '8px' },
  simLabel: { fontSize: '11px', color: '#64748b' },
  simBar: { width: '80px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  simBarFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' },
  simPct: { fontSize: '12px', fontWeight: '700', color: '#92400e' },
  dupExplain: { fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' },
  existingCard: {
    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '16px', marginBottom: '20px',
  },
  existingTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  existingId: { fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '600' },
  existingTitle: { fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' },
  existingDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px' },
  existingMeta: { fontSize: '11px', color: '#94a3b8' },
  upvoteSection: {
    backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
    borderRadius: '8px', padding: '16px', marginBottom: '20px',
  },
  upvoteInfo: { display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' },
  upvoteCount: { fontSize: '24px', fontWeight: '800', color: '#1d4ed8' },
  upvoteLabel: { fontSize: '13px', color: '#475569' },
  upvoteBtn: {
    width: '100%', padding: '11px', backgroundColor: '#1e3a5f',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  upvoteBtnLoading: {
    width: '100%', padding: '11px', backgroundColor: '#94a3b8',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'not-allowed',
  },
  upvotedMsg: {
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: '6px', padding: '10px 14px',
    color: '#166534', fontSize: '13px', fontWeight: '500',
  },
  upvoteErr: {
    marginTop: '8px', fontSize: '12px', color: '#b91c1c',
  },
  dupActions: { display: 'flex', gap: '12px' },
};

export default SubmitComplaint;
