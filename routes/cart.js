const express = require('express');
const pool = require('../database'); 
const router = express.Router();

router.post('/api/cart', async (req, res) => {
  const { userId, items } = req.body;

  try {
    await pool.query('BEGIN');

    for (const item of items) {
      const existsResult = await pool.query('SELECT quantity FROM carts WHERE user_id = $1 AND product_id = $2', [userId, item.product_id]);

      if (existsResult.rowCount > 0) {
        const existingQuantity = existsResult.rows[0].quantity;
        const newQuantity = existingQuantity + item.quantity;
        await pool.query('UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3', [newQuantity, userId, item.product_id]);
      } else {
        await pool.query('INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3)', [userId, item.product_id, item.quantity]);
      }
    }

    await pool.query('COMMIT');
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// Get all items in the cart for a user
router.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cartItems = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    res.json(cartItems.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving cart items', error: error.message });
  }
});

// Update quantity of a cart item
router.put('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const updatedCartItem = await pool.query(
      'UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, userId, productId]
    );
    res.json(updatedCartItem.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
});

// Remove an item from the cart
router.delete('/api/cart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    await pool.query('DELETE FROM carts WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing cart item', error: error.message });
  }
});

router.delete('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query('DELETE FROM carts WHERE user_id = $1', [userId]);
    res.json({ message: 'Cart removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing cart', error: error.message });
  }
});



module.exports = router;
