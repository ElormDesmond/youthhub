require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./src/db/database');

// Import routes
const memberRoutes = require('./src/routes/members');
const sessionRoutes = require('./src/routes/sessions');
const attendanceRoutes = require('./src/routes/attendance');
const reportRoutes = require('./src/routes/reports');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const mediaRoutes = require('./src/routes/media');
const financeRoutes = require('./src/routes/finance');
const serviceRoutes = require('./src/routes/services');
const paymentRoutes = require('./src/routes/payments');
const notificationRoutes = require('./src/routes/notifications');

const app = express();

// ============ SECURITY HEADERS (HELMET) ============
app.use(helmet({
    contentSecurityPolicy: false, // Allows cross-origin images/media from church cloud storage
    crossOriginEmbedderPolicy: false
}));

// ============ DATABASE CONNECTION ============
const pool = {
    query: (text, params) => db.query(text, params),
};

// Make pool available to routes
app.locals.pool = pool;

// ============ SECURE CORS CONFIGURATION ============
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002'
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) || 
            origin.endsWith('.vercel.app') || 
            process.env.NODE_ENV !== 'production'
        ) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ============ RATE LIMITING ============
// 1. General API rate limiter (300 requests per 15 minutes)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

// 2. Strict Auth Rate Limiter: prevents brute-force login attacks (10 attempts / 15 mins)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});
app.use('/api/auth/login', authLimiter);

// 3. Payment Rate Limiter (20 payment submissions / 15 mins)
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Payment rate limit reached. Please wait a few moments.' }
});
app.use('/api/payments/momo', paymentLimiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            church: 'Global Evangelical Church Youth (Kasoa Branch)',
            database: 'connected',
            driver: db.getDriver(),
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: err.message
        });
    }
});

// ============ API ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🌍 CORS enabled for all origins`);
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
