const express = require('express');
const pool = require('../database');
const router = express.Router();
const nodemailer = require('nodemailer');

  router.post('/api/sales-receipts', async (req, res) => {
    const { seller_id, customer_name, items, discount, paymentMethod, total } = req.body;
    try {
      await pool.query('BEGIN');
  
      const receiptResult = await pool.query(
        'INSERT INTO salesreceipts.salesreceipts (seller_id, customer_name, total_amount, payment_method, discount, date) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING receipt_id',
        [seller_id, customer_name, total, paymentMethod, discount]
      );
  
      const receiptId = receiptResult.rows[0].receipt_id;

    for (const item of items) {
      await pool.query(
        'INSERT INTO salesreceipts.receipt_items (receipt_id, name, product_id, service_id, quantity, price_per_unit, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (receipt_id, product_id, service_id) DO UPDATE SET quantity = EXCLUDED.quantity, total_price = EXCLUDED.total_price',
        [receiptId, item.name, item.product_id, item.service_id, item.quantity, item.price_per_unit, item.total_price]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Receipt saved successfully', receiptId });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Query Failed:', error.message);
    console.error('Query SQL:', error.query);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/sales-receipts', async (req, res) => {
  try {
    const query = 'SELECT * FROM salesreceipts.salesreceipts';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sales receipts', error: err.message });
  }
});

router.put('/api/sales-receipts/:id', async (req, res) => {
  const { id } = req.params;
  const { seller_id, customer_name, items, discount, paymentMethod, total } = req.body;
  try {
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE salesreceipts.salesreceipts SET seller_id = $1, customer_name = $2, total_amount = $3, payment_method = $4, discount = $5 WHERE receipt_id = $6',
      [seller_id, customer_name, total, paymentMethod, discount, id]
    );

    await pool.query(
      'DELETE FROM salesreceipts.receipt_items WHERE receipt_id = $1',
      [id]
    );

    for (const item of items) {
      // Check if the product already exists in the cart
      const existsResult = await pool.query('SELECT quantity FROM salesreceipts.receipt_items WHERE receipt_id = $1 AND product_id = $2', [id, item.product_id]);

      if (existsResult.rowCount > 0) {
        // Product exists, update the quantity
        const existingQuantity = existsResult.rows[0].quantity;
        const newQuantity = existingQuantity + item.quantity;
        await pool.query('UPDATE salesreceipts.receipt_items SET quantity = $1 WHERE receipt_id = $2 AND product_id = $3', [newQuantity, id, item.product_id]);
      } else {
      await pool.query(
        'INSERT INTO salesreceipts.receipt_items (receipt_id, name, product_id, service_id, quantity, price_per_unit, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, item.name, item.product_id, item.service_id, item.quantity, item.price_per_unit, item.total_price]
      );}
    }

    await pool.query('COMMIT');
    res.status(200).json({ message: 'Receipt updated successfully', receiptId: id });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/sales-receipts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const receiptDetails = await pool.query(
      `SELECT receipt_id AS id, seller_id, total_amount AS total, payment_method, discount FROM salesreceipts.salesreceipts WHERE receipt_id = $1`, [id]
    );
    
    const items = await pool.query(
      `SELECT * FROM salesreceipts.receipt_items WHERE receipt_id = $1`, [id]
    );

    if (receiptDetails.rows.length > 0) {
      const receipt = receiptDetails.rows[0];
      receipt.items = items.rows; 
      res.json(receipt);
    } else {
      res.status(404).send('Receipt not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.delete('/api/sales-receipts/:id', async (req, res) => {
  console.log(req.params.id);
  try {
      const result_item = await pool.query('DELETE FROM salesreceipts.receipt_items WHERE receipt_id = $1 RETURNING *', [req.params.id]);
      const result = await pool.query('DELETE FROM salesreceipts.salesreceipts WHERE receipt_id = $1 RETURNING *', [req.params.id]);
      if (result.rows.length && result_item.rows.length) {
        res.status(201).json({ message: 'Receipt deleted successfully'});
      } else {
          res.status(404).json({ error: 'Reçu introuvable' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({error: 'Echec de la suppression du reçu'});
  }
});

router.post('/api/sales-receipts/send-receipt', async (req, res) => {
  try {
    const {receipt,email} = req.body;

    await sendReceiptEmail(receipt,email);
    res.status(200).send('Receipt sent successfully');
  } catch (error) {
    console.error('Failed to send receipt:', error);
    res.status(500).send('Error sending receipt');
  }
});

async function sendReceiptEmail(receipt,userEmail) {

  const receiptHtml = generateReceiptHtml(receipt);

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: 'seanergy.procuratio123@gmail.com',
      pass: 'gfei lscy vnrb uzli', 
    },
  });

  let info = await transporter.sendMail({
    from: '"Procuratio Receipt" <seanergy.procuratio123@gmail.com>',
    to: userEmail,
    subject: "Your receipt",
    html: receiptHtml,
  });

  console.log("Receipt email sent: %s", info.messageId);
}

function generateReceiptHtml(receipt) {

  const now = new Date();
  const currentDateTime = now.toLocaleString();
  let itemsHtml = receipt.items.map(item => 
    `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price_per_unit}</td>
      <td>${item.total_price}</td>
    </tr>`
  ).join('');

  return `
    <html>
      <head>
        <style>
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h2>Receipt</h2>
        <p>Date: ${currentDateTime}</p>
        <p>Customer: ${receipt.customerName}</p>
        <table>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          ${itemsHtml}
        </table>
        <p>Subtotal: ${receipt.subtotal}</p>
        <p>Discount: ${receipt.discount}</p>
        <p>Total: ${receipt.total}</p>
      </body>
    </html>
  `;
}


module.exports = router;