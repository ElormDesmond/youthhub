const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

// ============ GALLERY & MEDIA MANAGEMENT ============

/**
 * Get all gallery items (Photos, Videos, Event tags)
 */
exports.getGallery = async (req, res) => {
    try {
        const { media_type, tag } = req.query;
        const queryRunner = getQueryRunner(req);

        let query = `
            SELECT 
                g.*,
                u.first_name as uploader_first_name,
                u.last_name as uploader_last_name
            FROM gallery g
            LEFT JOIN users u ON g.uploaded_by = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (media_type) {
            query += ` AND g.media_type = $${paramCount}`;
            params.push(media_type);
            paramCount++;
        }

        if (tag) {
            query += ` AND g.tags LIKE $${paramCount}`;
            params.push(`%${tag}%`);
            paramCount++;
        }

        query += ` ORDER BY g.event_date DESC, g.created_at DESC`;

        const result = await queryRunner(query, params);
        res.json({
            success: true,
            count: result.rows.length,
            gallery: result.rows
        });
    } catch (err) {
        console.error('Get gallery error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Add photo or video link to media gallery
 */
exports.addGalleryItem = async (req, res) => {
    try {
        const { title, description, media_type = 'image', media_url, video_embed_url, tags = 'Youth Life', event_date } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!title || !media_url) {
            return res.status(400).json({ success: false, error: 'Title and Media URL are required' });
        }

        const query = `
            INSERT INTO gallery (title, description, media_type, media_url, video_embed_url, tags, event_date, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const result = await queryRunner(query, [
            title.trim(),
            description || null,
            media_type,
            media_url.trim(),
            video_embed_url ? video_embed_url.trim() : null,
            tags.trim(),
            event_date || new Date().toISOString().slice(0, 10),
            req.user ? req.user.id : 2 // Default media team user
        ]);

        res.status(201).json({
            success: true,
            message: 'Media added to gallery successfully',
            item: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Delete media item
 */
exports.deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        await queryRunner('DELETE FROM gallery WHERE id = $1', [id]);
        res.json({ success: true, message: 'Gallery item removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
