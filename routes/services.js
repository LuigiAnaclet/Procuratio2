const express = require('express');
const pool = require('../database');
const router = express.Router();

//Même logique que pour les produits
router.post('/api/services', async (req, res) => {
    const { name, duration, price, composition ,supplier, service_date} = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO Services.Services (name, duration, price, composition, supplier, service_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, duration, price, composition, supplier, service_date]
          );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la création du service'});
    }
});


router.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Services.Services');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Échec de la récupération des services'});
    }
});

router.get('/api/services/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Services.Services WHERE service_id = $1', [req.params.id]);
        
        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Service introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la récupération du service'});
    }
});

router.put('/api/services/:id', async (req, res) => {
    const { name, duration, price, composition } = req.body;

    try {
        const result = await pool.query(
            'UPDATE Services.Services SET name=$1, duration=$2, price=$3, composition=$4 RETURNING *',
            [name, duration, price, composition]
        );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Service introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la mise à jour du service'});
    }
});

router.delete('/api/services/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM appointments.appointments WHERE service_id = $1 RETURNING *', [req.params.id])
        await pool.query('DELETE FROM salesreceipts.receipt_items WHERE service_id = $1 RETURNING *', [req.params.id])
        const result = await pool.query('DELETE FROM Services.Services WHERE service_id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length) {
            res.json({ message: 'Service supprimé avec succès' });
        } else {
            res.status(404).json({ error: 'Service introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la suppression du produit'});
    }
});

module.exports = router;
