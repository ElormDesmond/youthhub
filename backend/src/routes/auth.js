const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

/**
 * Login endpoint - supports login via email OR username
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email/username and password are required' });
        }

        const identifier = email.toLowerCase().trim();
        const userRes = await db.query(`
            SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE LOWER(u.email) = $1 OR LOWER(COALESCE(u.username, '')) = $1
        `, [identifier]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email/username or password' });
        }

        const user = userRes.rows[0];

        // Verify password hash strictly with bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email/username or password' });
        }

        const isMaster = user.email === 'babayaga@local' || user.role_id === 6;

        const tokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username || null,
            first_name: user.first_name,
            last_name: user.last_name,
            title: user.title,
            role_id: user.role_id,
            role: isMaster ? 'master_observer' : (user.role_name || (user.role_id === 1 ? 'admin' : 'volunteer')),
            role_display_name: user.role_display_name || (isMaster ? 'Master Troubleshooter' : 'Staff'),
            is_master: isMaster,
            permissions: user.permissions
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
        const userRes = await db.query(`
            SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.title, u.role_id,
                   r.name AS role_name, r.display_name AS role_display_name
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = $1
        `, [req.user.id]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = userRes.rows[0];
        const isMaster = user.email === 'babayaga@local' || user.role_id === 6;

        res.json({
            success: true,
            user: {
                ...user,
                role: isMaster ? 'master_observer' : (user.role_name || (user.role_id === 1 ? 'admin' : 'volunteer')),
                is_master: isMaster
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * Update Profile, Email, Username and/or Password
 */
router.put('/profile', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, email, username, current_password, new_password } = req.body;

        const existingRes = await db.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        if (existingRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const existing = existingRes.rows[0];

        // Email uniqueness check
        if (email && email.toLowerCase().trim() !== existing.email.toLowerCase()) {
            const checkEmail = await db.query(`SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2`, [email.toLowerCase().trim(), userId]);
            if (checkEmail.rows.length > 0) {
                return res.status(409).json({ success: false, error: 'This email is already in use by another account' });
            }
        }

        // Username uniqueness check
        if (username && username.toLowerCase().trim() !== (existing.username || '').toLowerCase()) {
            const checkUsername = await db.query(`SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2`, [username.toLowerCase().trim(), userId]);
            if (checkUsername.rows.length > 0) {
                return res.status(409).json({ success: false, error: 'This username is already taken by another account' });
            }
        }

        // Password change logic
        let passwordHash = existing.password_hash;
        if (new_password) {
            if (new_password.length < 6) {
                return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
            }
            if (current_password) {
                const isMatch = await bcrypt.compare(current_password, existing.password_hash);
                if (!isMatch) {
                    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
                }
            }
            passwordHash = await bcrypt.hash(new_password, 10);
        }

        const updatedEmail = email ? email.toLowerCase().trim() : existing.email;
        const updatedUsername = username !== undefined ? (username ? username.toLowerCase().trim() : null) : existing.username;
        const updatedFn = first_name ? first_name.trim() : existing.first_name;
        const updatedLn = last_name ? last_name.trim() : existing.last_name;

        await db.query(`
            UPDATE users
            SET email = $1,
                username = $2,
                first_name = $3,
                last_name = $4,
                password_hash = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
        `, [updatedEmail, updatedUsername, updatedFn, updatedLn, passwordHash, userId]);

        const updatedUserRes = await db.query(`
            SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = $1
        `, [userId]);
        const updatedUser = updatedUserRes.rows[0];
        const isMaster = updatedUser.email === 'babayaga@local' || updatedUser.role_id === 6;

        const tokenPayload = {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            title: updatedUser.title,
            role_id: updatedUser.role_id,
            role: isMaster ? 'master_observer' : (updatedUser.role_name || 'admin'),
            role_display_name: updatedUser.role_display_name,
            is_master: isMaster,
            permissions: updatedUser.permissions
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'Profile and security credentials updated successfully',
            token,
            user: tokenPayload
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
