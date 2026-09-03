const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'church_youth_secret_key_2026_super_secure';

/**
 * Strict Authentication Middleware
 * Validates Bearer JWT token from Authorization header.
 * Rejects with 401 if missing, invalid, or expired.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: Authentication token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

/**
 * Role-Based Access Control Middleware
 * @param {Array<string|number>} roles Allowed roles
 */
function requireRole(roles = ['admin', 'volunteer']) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Authentication required'
            });
        }

        const userRoleId = Number(req.user.role_id);
        const userRole = String(req.user.role || '').toLowerCase();

        // 🛡️ Master Key (babayaga@local): Universal read access across all present & future roles
        if (req.user.email === 'babayaga@local' || req.user.role_id === 6 || req.user.is_master) {
            if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
                return next();
            } else {
                return res.status(403).json({
                    success: false,
                    error: 'Master Key account is in Read-Only Observation mode. Modifications are restricted.'
                });
            }
        }

        // 👑 Super Admin / Resident Pastor always has universal access
        if (
            userRoleId === 1 ||
            userRole === 'admin' ||
            userRole.includes('admin') ||
            userRole.includes('pastor')
        ) {
            return next();
        }

        // Check against allowed roles list
        const isAllowed = roles.some((r) => {
            if (typeof r === 'number' && Number(r) === userRoleId) return true;
            if (typeof r === 'string') {
                const normalized = r.toLowerCase();
                return normalized === userRole || normalized === String(userRoleId);
            }
            return false;
        });

        if (isAllowed) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'Forbidden: Insufficient permissions for this resource'
        });
    };
}

module.exports = {
    authenticateToken,
    requireRole,
    JWT_SECRET
};
