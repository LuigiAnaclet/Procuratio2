const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 50; 
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const advertisingRoutes = require('./routes/advertisingCampaigns');
const appointmentRoutes = require('./routes/appointments');
const usersRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const receiptRoutes = require('./routes/salesReceipts');
const promoRoutes=require('./routes/promo');
const customersRoutes=require('./routes/customers');
const messages=require('./messages');
const paymentsRoutes=require('./routes/payment');
const PORT = 3000;
require('dotenv').config();

app.use(cors()); 
app.use(express.json()); 


// Route permettant de faire les requètes vers la bdd
app.use(cartRoutes);
app.use(receiptRoutes);
app.use(productRoutes);
app.use(serviceRoutes);
app.use(advertisingRoutes);
app.use(appointmentRoutes);
app.use(usersRoutes);
app.use(promoRoutes);
app.use(messages);
app.use(customersRoutes);
app.use(paymentsRoutes);




//Répertoire de base des fichiers
app.use(express.static(__dirname + '/Procuratio-Frontend/dist/Procuratio-Frontend/'));

//Répertoire des images stockées
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Pour toutes les requêtes GET, renvoyer index.html
// Routing vers front-end angular
app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/Procuratio-Frontend/dist/Procuratio-Frontend/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


