const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

/**
 * Login endpoint
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const userRes = await db.query(`
            SELECT u.*, r.name AS role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.email = $1
        `, [email.toLowerCase().trim()]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const user = userRes.rows[0];

        // Verify password hash strictly with bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role_id: user.role_id,
            role: user.role_name || 'admin'
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: tokenPayload
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Get current authenticated user profile
 */
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
