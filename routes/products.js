const express = require('express');
const pool = require('../database');
const router = express.Router();
const multer = require('multer');
const path = require('path');


/***************************************************************************/
/******* ************** Gestion des produits ********************************/ 
/***************************************************************************/

// PATCH route to reduce product quantity
router.patch('/api/products/reduceQuantity/:id', async (req, res) => {
    const { quantity } = req.body;

    try {
        
        const result = await pool.query(
            'UPDATE Products.Products SET quantity = quantity - $1 WHERE product_id = $2 RETURNING *',
            [quantity, req.params.id]
        );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reduce product quantity' });
    }
});

//Ajouter des produits
router.post('/api/products', async (req, res) => {
    const { name, picture, quantity, price, description, brand, type, supplier, date_added } = req.body;

    try {

        const newProduct = await pool.query(
            'INSERT INTO Products.Products (name, picture, quantity, price, description, brand, type, supplier, date_added) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, picture, quantity, price, description, brand, type, supplier, date_added || new Date()]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    } 
});


// Récupérer tous les produits
router.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Products.Products');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Échec de la récupération des produits'});
    }
});

//Rechercher un produit spécifique
router.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Products.Products WHERE product_id = $1', [req.params.id]);
        
        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Produit introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la récupération du produit'});
    }
});

//Mettre à jour un produit
router.put('/api/products/:id', async (req, res) => {
    const { name, picture, quantity, price, description, brand, type, date_added } = req.body;

    try {
        const result = await pool.query(
            'UPDATE Products.Products SET name=$1, picture=$2, quantity=$3, price=$4, description=$5, brand=$6, type=$7,date_added=$8 WHERE product_id = $9 RETURNING *',
            [name, picture, quantity, price, description, brand, type, date_added, req.params.id]
        );

        if (result.rows.length) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Produit introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la mise à jour du produit'});
    }
});

//Supprimer un produit
router.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM salesreceipts.receipt_items WHERE product_id = $1 RETURNING *', [req.params.id])
        const result = await pool.query('DELETE FROM Products.Products WHERE product_id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length) {
            res.json({ message: 'Produit supprimé avec succès' });
        } else {
            res.status(404).json({ error: 'Produit introuvable' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Echec de la suppression du produit'});
    }
});

//Setup du stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'uploads')); // Use path.resolve to navigate one level up from current directory to the uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
  });
  
  const upload = multer({ storage: storage });

router.post('/api/products/uploads', upload.single('image'), (req, res, next) => {
    const imageUrl = 'http://localhost:3000/uploads/' + req.file.filename; 
    res.status(200).json({ imageUrl: imageUrl });
});




module.exports = router;