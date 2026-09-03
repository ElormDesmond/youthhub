require('dotenv').config();
const path = require('path');
const fs = require('fs');

let dbDriver = process.env.DB_TYPE || 'auto';
let pgPool = null;
let sqliteDb = null;

function setupSqlite() {
    dbDriver = 'sqlite';
    const Database = require('better-sqlite3');
    const dbPath = path.resolve(__dirname, '../../youth_attendance.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('foreign_keys = ON');
    sqliteDb.pragma('journal_mode = WAL');
    return sqliteDb;
}

// Initialize Database connection
function initDatabase() {
    const isSqliteForced = process.env.DB_TYPE === 'sqlite';
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    const isPostgresForced = process.env.DB_TYPE === 'postgres' || hasDatabaseUrl;

    if (!isSqliteForced && isPostgresForced) {
        try {
            const { Pool } = require('pg');
            const poolConfig = process.env.DATABASE_URL
                ? {
                    connectionString: process.env.DATABASE_URL,
                    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
                    connectionTimeoutMillis: 5000,
                  }
                : {
                    user: process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASSWORD || 'postgrespassword',
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '5432', 10),
                    database: process.env.DB_NAME || 'youth_attendance',
                    connectionTimeoutMillis: 2000,
                };

            pgPool = new Pool(poolConfig);

            pgPool.on('error', (err) => {
                console.error('PostgreSQL idle client error:', err.message);
            });
            dbDriver = 'pg';
        } catch (err) {
            console.warn('PostgreSQL driver init warning:', err.message);
            setupSqlite();
        }
    } else {
        // Default to SQLite for zero-configuration local development
        setupSqlite();
    }
}

initDatabase();

/**
 * Universal query runner: supports $1, $2 params for Postgres and SQLite
 */
async function query(text, params = []) {
    if (dbDriver === 'pg' && pgPool) {
        try {
            const res = await pgPool.query(text, params);
            return res;
        } catch (err) {
            // Fallback to SQLite if connection/auth error
            if (process.env.DB_TYPE !== 'postgres') {
                console.warn('⚠️ Postgres auth/connection error, using local SQLite database...');
                if (!sqliteDb) setupSqlite();
                return querySqlite(text, params);
            }
            throw err;
        }
    } else {
        if (!sqliteDb) setupSqlite();
        return querySqlite(text, params);
    }
}

function querySqlite(text, params = []) {
    // Convert $1, $2 to ? for sqlite
    let sqliteQuery = text.replace(/\$(\d+)/g, '?');
    
    // Replace PostgreSQL specific functions / types if needed
    sqliteQuery = sqliteQuery
        .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/NOW\(\)/gi, "datetime('now')")
        .replace(/ILIKE/gi, 'LIKE')
        .replace(/CURRENT_DATE - INTERVAL '2 days'/gi, "date('now', '-2 days')")
        .replace(/CURRENT_DATE \+ INTERVAL '1 day'/gi, "date('now', '+1 day')")
        .replace(/CURRENT_TIMESTAMP - INTERVAL '2 days'/gi, "datetime('now', '-2 days')")
        .replace(/ON CONFLICT \(id\) DO NOTHING/gi, '')
        .replace(/ON CONFLICT \(member_id, session_id\)[\s\S]*?;/gi, ';');

    const trimmed = sqliteQuery.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('PRAGMA')) {
        const stmt = sqliteDb.prepare(sqliteQuery);
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
    } else if (trimmed.includes('RETURNING')) {
        try {
            const stmt = sqliteDb.prepare(sqliteQuery);
            const rows = stmt.all(...params);
            return { rows, rowCount: rows.length };
        } catch {
            const baseQuery = sqliteQuery.replace(/RETURNING\s+[\s\S]*$/i, '');
            const stmt = sqliteDb.prepare(baseQuery);
            const info = stmt.run(...params);
            const lastId = info.lastInsertRowid;
            return { rows: [{ id: lastId }], rowCount: info.changes, lastID: lastId };
        }
    } else {
        const stmt = sqliteDb.prepare(sqliteQuery);
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes, lastID: info.lastInsertRowid };
    }
}

module.exports = {
    query,
    getPool: () => pgPool,
    getDriver: () => dbDriver,
    setupSqlite
};
