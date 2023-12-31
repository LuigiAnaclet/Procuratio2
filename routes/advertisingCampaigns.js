const nodemailer = require('nodemailer');
const twilio = require('twilio');
const express = require('express');
const pool = require('../database');
const cron = require('node-cron');
const router = express.Router();

// Créer une nouvelle campagne
router.post('/api/campaigns', async (req, res) => {
    console.log(req.body);
    const { title, message, sendDate } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO advertisingcampaigns.campaigns (name, message, send_date) VALUES ($1, $2, $3) RETURNING *',
            [title, message, sendDate]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Échec de la création de la campagne'});
    }
});

async function sendCampaignEmailToAllCustomers(campaign) {
    const customersResult = await pool.query('SELECT email FROM customers');
    const customerEmails = customersResult.rows.map(row => row.email);
    customerEmails.forEach(async email => {
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
            from: campaign.name,
            to: email,
            subject: campaign.name,
            text: campaign.message,
          });
          console.log("Message sent: %s", info.messageId);
      });
}

const accountSid = 'AC5d3c01c2713782ec506feb088f6bd9c8';
const authToken = 'd477e5b99c9892a40a8ef89cb76ded24';
const client = new twilio(accountSid, authToken);

async function sendCampaignSmsToAllCustomers(campaign) {
    const customersResult = await pool.query('SELECT phone FROM customers');
    const customerPhones = customersResult.rows.map(row => row.phone);
    customerPhones.forEach(async phone => {
        client.messages.create({
            body: `${campaign.name} ${campaign.message}`,
            to: phone,
            from: '+17605238469' 
          })
          .then((message) => console.log(message.sid));
      });
}

async function getCampaignsToSend() {
    const today = new Date().toISOString().slice(0, 10);
    const query = `
      SELECT * FROM advertisingcampaigns.campaigns
      WHERE send_date = $1;
    `;
    
    try {
      const { rows } = await pool.query(query, [today]);
      return rows;
    } catch (err) {
      console.error('Error fetching campaigns to send:', err);
      throw err;
    }
  }

cron.schedule('0 8 * * *', async () => {
    //console.log('Running send campaigns task at 8 AM');
    
    const campaignsToSendToday = await getCampaignsToSend();
    
    campaignsToSendToday.forEach(sendCampaignEmailToAllCustomers);
    campaignsToSendToday.forEach(sendCampaignSmsToAllCustomers);
  });


module.exports = router;