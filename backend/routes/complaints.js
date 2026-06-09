const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
// This runs before every route below. It checks the JWT token in the request
// header and attaches the user info (id, role) to req.user
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ─── ANALYTICS (must be before /:id routes) ───────────────────────────────────
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'OPEN') as open,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
                COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
                COUNT(*) FILTER (WHERE status = 'ESCALATED') as escalated
            FROM complaints
        `);
        const byCategory = await pool.query(`
            SELECT cc.name, COUNT(c.id) as count
            FROM complaint_categories cc
            LEFT JOIN complaints c ON c.category_id = cc.id
            GROUP BY cc.name
            ORDER BY count DESC
        `);
        res.json({ stats: stats.rows[0], byCategory: byCategory.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── MY COMPLAINTS (for students) ─────────────────────────────────────────────
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*,
                   u.name as student_name,
                   cat.name as category_name,
                   (
                       (COALESCE(c.upvote_count, 0) * 2)
                       + COALESCE(cat.weight, 1)
                       + (COALESCE(c.escalation_level, 0) * 10)
                       + LEAST(EXTRACT(DAY FROM NOW() - c.created_at)::int, 7)
                   ) as priority_score
            FROM complaints c
            LEFT JOIN users u ON c.student_id = u.id
            LEFT JOIN complaint_categories cat ON c.category_id = cat.id
            WHERE c.student_id = $1
            ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── PRIORITY SCORE FORMULA (explained) ───────────────────────────────────────
// priority_score = (upvote_count * 2) + (category weight) + (escalation_level * 10) + (age in days, max 7)
// - upvotes × 2   → more students affected = more urgent
// - category weight → Electrical(5) > Plumbing(4) > Hostel/IT(3) > Transport(2) > Library(1)
// - escalation × 10 → already escalated means clearly serious
// - age bonus      → old unresolved complaints get bumped up (max 7 points)
// We calculate this in SQL so it's always fresh and never stale

const PRIORITY_SELECT = `
    SELECT c.*,
           u.name as student_name,
           cat.name as category_name,
           (
               (COALESCE(c.upvote_count, 0) * 2)
               + COALESCE(cat.weight, 1)
               + (COALESCE(c.escalation_level, 0) * 10)
               + LEAST(EXTRACT(DAY FROM NOW() - c.created_at)::int, 7)
           ) as priority_score
    FROM complaints c
    LEFT JOIN users u ON c.student_id = u.id
    LEFT JOIN complaint_categories cat ON c.category_id = cat.id
`;

// ─── GET ALL COMPLAINTS (with optional role-based filtering) ──────────────────
router.get('/', authenticateToken, async (req, res) => {
    try {
        const role = req.user.role;
        let query = '';
        let params = [];

        if (role === 'SUPPORT_STAFF') {
            // Support Staff sees COLLEGE complaints assigned to them OR unassigned OPEN ones
            // (level 0 — first handler in the college chain)
            query = `
                ${PRIORITY_SELECT}
                WHERE (c.assigned_to = $1 OR (c.assigned_to IS NULL AND c.status = 'OPEN'))
                AND cat.routes_to = 'SUPPORT_STAFF'
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
            params = [req.user.id];
        } else if (role === 'COORDINATOR') {
            // Coordinator sees COLLEGE complaints escalated from Support Staff (level >= 1)
            query = `
                ${PRIORITY_SELECT}
                WHERE c.escalation_level >= 1
                AND cat.routing_type = 'COLLEGE'
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else if (role === 'HOD') {
            // HOD sees COLLEGE complaints escalated from Coordinator (level >= 2)
            query = `
                ${PRIORITY_SELECT}
                WHERE c.escalation_level >= 2
                AND cat.routing_type = 'COLLEGE'
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else if (role === 'WARDEN') {
            // Warden sees HOSTEL complaints at level 0 (first handler in hostel chain)
            query = `
                ${PRIORITY_SELECT}
                WHERE cat.routing_type = 'HOSTEL'
                AND c.escalation_level = 0
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else if (role === 'HOSTEL_MANAGER') {
            // Hostel Manager sees HOSTEL complaints escalated from Warden (level >= 1)
            query = `
                ${PRIORITY_SELECT}
                WHERE cat.routing_type = 'HOSTEL'
                AND c.escalation_level >= 1
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else if (role === 'LIBRARIAN') {
            // Librarian sees all Library complaints (level 0)
            query = `
                ${PRIORITY_SELECT}
                WHERE cat.routes_to = 'LIBRARIAN'
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else if (role === 'TRANSPORT_MANAGER') {
            // Transport Manager sees all Transport complaints (level 0)
            query = `
                ${PRIORITY_SELECT}
                WHERE cat.routes_to = 'TRANSPORT_MANAGER'
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        } else {
            // ADMIN sees everything, sorted by priority
            query = `
                ${PRIORITY_SELECT}
                ORDER BY (COALESCE(c.upvote_count,0)*2 + COALESCE(cat.weight,1) + COALESCE(c.escalation_level,0)*10 + LEAST(EXTRACT(DAY FROM NOW()-c.created_at)::int,7)) DESC, c.created_at DESC
            `;
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── SUBMIT NEW COMPLAINT ──────────────────────────────────────────────────────
// Uses PostgreSQL's built-in SIMILARITY() function from the pg_trgm extension.
// SIMILARITY(text1, text2) returns a value between 0 and 1.
// 0 = completely different, 1 = identical.
// We use > 0.4 as the threshold — meaning 40% similar text triggers duplicate detection.
// This is a PostgreSQL built-in — no external library needed.
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const student_id = req.user.id;

        if (!title || !description || !category_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // pg_trgm SIMILARITY() — PostgreSQL built-in text similarity function
        // It breaks text into trigrams (3-character chunks) and compares overlap.
        // Example: "lights not working" vs "lights are not working" → ~0.72 similarity
        const similar = await pool.query(`
            SELECT
                id, title, description, status, upvote_count, created_at,
                SIMILARITY(title, $1) AS title_sim,
                SIMILARITY(description, $2) AS desc_sim,
                GREATEST(SIMILARITY(title, $1), SIMILARITY(description, $2)) AS max_sim
            FROM complaints
            WHERE category_id = $3
            AND status != 'RESOLVED'
            AND (
                SIMILARITY(title, $1) > 0.4
                OR SIMILARITY(description, $2) > 0.4
            )
            ORDER BY max_sim DESC
            LIMIT 1
        `, [title, description, category_id]);

        if (similar.rows.length > 0) {
            const existing = similar.rows[0];
            const simPercent = Math.round(existing.max_sim * 100);
            return res.status(409).json({
                error: 'Similar complaint already exists',
                similarityPercent: simPercent,
                existingComplaint: {
                    id: existing.id,
                    title: existing.title,
                    description: existing.description,
                    status: existing.status,
                    upvote_count: existing.upvote_count,
                    created_at: existing.created_at,
                }
            });
        }

        const result = await pool.query(`
            INSERT INTO complaints
            (title, description, student_id, category_id, status)
            VALUES ($1, $2, $3, $4, 'OPEN')
            RETURNING *
        `, [title, description, student_id, category_id]);

        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── UPDATE STATUS ─────────────────────────────────────────────────────────────
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE complaints
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        res.json({
            message: 'Status updated successfully',
            complaint: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── ACCEPT COMPLAINT (Support Staff accepts a complaint) ─────────────────────
// When staff clicks "Accept", the complaint gets assigned to them
// and status changes to IN_PROGRESS
router.patch('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            UPDATE complaints
            SET assigned_to = $1, status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [req.user.id, id]);

        res.json({
            message: 'Complaint accepted',
            complaint: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── ESCALATE COMPLAINT ────────────────────────────────────────────────────────
// This follows the EXACT flowchart from the project document (Figure 4.1):
//
// HOSTEL path:
//   Warden (level 0→1) → Hostel Manager (level 1→2) → Admin (level 2→3)
//
// COLLEGE path (Electrical/Plumbing/IT/Carpentry):
//   Support Staff (level 0→1) → Coordinator (level 1→2) → HOD (level 2→3) → Admin (level 3→4)
//
// LIBRARY/TRANSPORT path:
//   Librarian/Transport Manager (level 0→1) → Admin (level 1→2)
//
// Each role can only escalate to the NEXT role in their chain.
// The escalation_level tracks how far up the chain the complaint has gone.

router.patch('/:id/escalate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const role = req.user.role;

        if (!reason) {
            return res.status(400).json({ error: 'Escalation reason is required' });
        }

        // Get current complaint with category info
        const current = await pool.query(`
            SELECT c.*, cat.routes_to, cat.routing_type
            FROM complaints c
            LEFT JOIN complaint_categories cat ON c.category_id = cat.id
            WHERE c.id = $1
        `, [id]);

        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const complaint = current.rows[0];
        const currentLevel = complaint.escalation_level || 0;
        const routingType = complaint.routing_type || 'COLLEGE';

        // Determine who this escalates TO (for the message)
        // and validate that the current role is ALLOWED to escalate this complaint
        let nextRole = '';
        let allowed = false;

        if (routingType === 'HOSTEL') {
            // Hostel path: Warden → Hostel Manager → Admin
            if (role === 'WARDEN' && currentLevel === 0) {
                nextRole = 'Hostel Manager'; allowed = true;
            } else if (role === 'HOSTEL_MANAGER' && currentLevel === 1) {
                nextRole = 'Admin'; allowed = true;
            }
        } else if (routingType === 'COLLEGE') {
            // College path: Support Staff → Coordinator → HOD → Admin
            if (role === 'SUPPORT_STAFF' && currentLevel === 0) {
                nextRole = 'Coordinator'; allowed = true;
            } else if (role === 'COORDINATOR' && currentLevel === 1) {
                nextRole = 'HOD'; allowed = true;
            } else if (role === 'HOD' && currentLevel === 2) {
                nextRole = 'Admin'; allowed = true;
            }
        } else {
            // Library/Transport path: Librarian/Transport Manager → Admin
            if ((role === 'LIBRARIAN' || role === 'TRANSPORT_MANAGER') && currentLevel === 0) {
                nextRole = 'Admin'; allowed = true;
            }
        }

        // Admin can always escalate (override)
        if (role === 'ADMIN') {
            nextRole = 'Admin (Final)'; allowed = true;
        }

        if (!allowed) {
            return res.status(403).json({
                error: `Your role (${role}) cannot escalate this complaint at level ${currentLevel}. It may already be at the highest level or not in your escalation chain.`
            });
        }

        const newLevel = currentLevel + 1;

        const result = await pool.query(`
            UPDATE complaints
            SET escalation_level = $1,
                escalation_reason = $2,
                status = 'ESCALATED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `, [newLevel, reason, id]);

        res.json({
            message: `Complaint escalated to ${nextRole} successfully`,
            nextRole,
            complaint: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── UPVOTE COMPLAINT ──────────────────────────────────────────────────────────
// A student can upvote a complaint once. We track this in the upvotes table.
// upvote_count on the complaint is updated automatically.
router.post('/:id/upvote', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if user already upvoted this complaint
        const existing = await pool.query(
            'SELECT id FROM upvotes WHERE complaint_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'You have already upvoted this complaint' });
        }

        // Add upvote record
        await pool.query(
            'INSERT INTO upvotes (complaint_id, user_id) VALUES ($1, $2)',
            [id, userId]
        );

        // Increase upvote_count on the complaint
        const result = await pool.query(`
            UPDATE complaints
            SET upvote_count = upvote_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING upvote_count
        `, [id]);

        res.json({
            message: 'Upvoted successfully',
            upvote_count: result.rows[0].upvote_count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── GET ALL USERS (Admin only) ────────────────────────────────────────────────
// Returns ALL registered users with their complaint counts
router.get('/users/all', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = await pool.query(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                COUNT(c.id) AS complaint_count
            FROM users u
            LEFT JOIN complaints c ON c.student_id = u.id
            GROUP BY u.id, u.name, u.email, u.role
            ORDER BY u.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
