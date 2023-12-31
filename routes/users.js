const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO Users (first_name, last_name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [first_name, last_name, email, hashedPassword, role, phone]
          );

          const user = result.rows[0];

        const userId = result.rows[0].user_id;
        if (role === 'employee') {
            await pool.query(
              'INSERT INTO employees (user_id, first_name, last_name, phone,email) VALUES ($1, $2, $3, $4,$5)',
              [userId, first_name, last_name, phone,email]
            );
          } else if (role === 'customer') {
            await pool.query(
              'INSERT INTO customers (user_id, first_name, last_name, phone,email) VALUES ($1, $2, $3, $4,$5)',
              [userId, first_name, last_name, phone,email]
            );
          }

        delete user.password;

        res.json({ user, message: 'User registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, 'your_secret_key');

        delete user.password;

        res.json({ user, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

router.get('/getUser/:email', async (req, res) => {

    try {
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [req.params.email]);
        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {    
           res.status(404).json({ error: 'User introuvable' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({error: 'Echec de la récupération du user'});
        }
    });

    router.get('/getEmployees/', async (req, res) => {
        try {
          const result = await pool.query('SELECT * FROM Users WHERE role = $1', ['employee']);
          res.json(result.rows); 
        } catch (err) {
          console.error(err);
          res.status(500).json({error: 'Echec de la récupération des employés'});
        }
      });

      router.get('/getCustomers/', async (req, res) => {
        try {
          const result = await pool.query('SELECT * FROM Users WHERE role = $1', ['customer']);
          res.json(result.rows); 
        } catch (err) {
          console.error(err);
          res.status(500).json({error: 'Echec de la récupération des clients'});
        }
      });

      router.get('/getAllCustomers/', async (req, res) => {
        try {
          const result = await pool.query('SELECT * FROM customers');
          res.json(result.rows); 
        } catch (err) {
          console.error(err);
          res.status(500).json({error: 'Echec de la récupération des clients'});
        }
      });
      
    

module.exports = router;
