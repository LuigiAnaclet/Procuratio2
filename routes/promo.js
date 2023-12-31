const express = require('express');
const pool = require('../database'); // Update with your actual pool import
const router = express.Router();

router.get('/api/promo-codes/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM promo_codes WHERE code = $1 AND (valid_until IS NULL OR valid_until > NOW())', [code]);

        if (result.rows.length > 0) {
            res.json({ valid: true, discount: result.rows[0].discount_percent });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
