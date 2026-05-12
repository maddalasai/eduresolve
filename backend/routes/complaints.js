const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

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

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as student_name, 
                   cat.name as category_name
            FROM complaints c
            LEFT JOIN users u ON c.student_id = u.id
            LEFT JOIN complaint_categories cat ON c.category_id = cat.id
            WHERE c.student_id = $1
            ORDER BY c.created_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as student_name, 
                   cat.name as category_name
            FROM complaints c
            LEFT JOIN users u ON c.student_id = u.id
            LEFT JOIN complaint_categories cat ON c.category_id = cat.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, category_id } = req.body;
        const student_id = req.user.id;

        if (!title || !description || !category_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const similar = await pool.query(`
            SELECT id, title, status FROM complaints
            WHERE category_id = $1
            AND status != 'RESOLVED'
            AND (SIMILARITY(title, $2) > 0.4 
            OR SIMILARITY(description, $3) > 0.4)
            LIMIT 1
        `, [category_id, title, description]);

        if (similar.rows.length > 0) {
            return res.status(409).json({
                error: 'Similar complaint already exists',
                existingComplaint: similar.rows[0]
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

module.exports = router;