const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.put('/api/customers/:id/addPoints', async (req, res) => {
    const { id } = req.params;
    const { points } = req.body;
    try {
        const fidelity_point = await pool.query('SELECT fidelity_point FROM customers WHERE user_id = $1', [id]);
      if (fidelity_point.rowCount > 0) {
        const existingFidelity = fidelity_point.rows[0].fidelity_point;
        const updatedFidelityPoints = existingFidelity + points;
        await pool.query('UPDATE customers SET fidelity_point = $1 WHERE user_id = $2 RETURNING *',[updatedFidelityPoints, id]);
      } else {
        await pool.query('UPDATE customers SET fidelity_point = $1 WHERE user_id = $2 RETURNING *',[points, id]);
      }
      await pool.query('COMMIT');
    res.status(200).json({ message: 'Fidelity points added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding Fidelity points ', error: error.message });
    }
  });

router.post('/api/customers/purchases', async (req, res) => {
    try {
        const { customer_id, date, total_amount, items } = req.body;
        const customerResult = await pool.query('SELECT customer_id FROM customers WHERE user_id = $1', [customer_id]);
        const itemsJson = JSON.stringify(items);
        const result = await pool.query(
            'INSERT INTO purchases (customer_id, date, total_amount, items) VALUES ($1, $2, $3, $4) RETURNING *',
            [customerResult.rows[0].customer_id, date, total_amount, itemsJson]
          );

          const user = result.rows[0];

        delete user.password;

        res.json({ user, message: 'Purchase registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to register purchase' });
    }
});

router.get('/api/customers/:id/purchases', async (req, res) => {
    const { id } = req.params;
  
    try {
        const customerId = await pool.query('SELECT customer_id FROM customers WHERE user_id = $1', [id]);
      const purchaseItems = await pool.query('SELECT * FROM purchases WHERE customer_id = $1', [customerId.rows[0].customer_id]);
      //console.log(purchaseItems.rows);
      res.json(purchaseItems.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving purchases', error: error.message });
    }
  });

  
    

module.exports = router;
