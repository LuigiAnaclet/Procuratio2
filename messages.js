const nodemailer = require('nodemailer');
const twilio = require('twilio');
const express = require('express');
const pool = require('./database');
const cron = require('node-cron');
const router = express.Router();


async function sendEmailReminder(appointment, userEmailAddress) {
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
    from: '"Upcoming appointment" <luigi.anaclet@hotmail.com>',
    to: userEmailAddress,
    subject: "Appointment Reminder",
    text: `This is a reminder for your upcoming appointment on ${appointment.appointment_date}.`,
  });
  await markReminderAsSent(appointment.appointment_id);
  console.log("Message sent: %s", info.messageId);
}

const accountSid = 'AC5d3c01c2713782ec506feb088f6bd9c8';
const authToken = 'd477e5b99c9892a40a8ef89cb76ded24';
const client = new twilio(accountSid, authToken);

async function sendSMSReminder(appointment, userPhoneNumber) {
  client.messages.create({
    body: `Reminder: You have an appointment on ${appointment.appointment_date} with Procuratio.`,
    to: userPhoneNumber,
    from: '+17605238469' 
  })
  .then((message) => console.log(message.sid));
}

// Schedule a task to run every hour
cron.schedule('* * */1 * *', () => {
    checkAndSendReminders();
  });

async function checkAndSendReminders() {
    try {
        const upcomingAppointments = await getUpcomingAppointments();
        upcomingAppointments.forEach(async appointment => {
            if(appointment.reminder_email === true) {
            const customerId = await pool.query('SELECT user_id FROM customers WHERE customer_id = $1', [appointment.customer_id]);
            const userResult = await pool.query('SELECT email FROM users WHERE user_id = $1', [customerId.rows[0].user_id]);
            sendEmailReminder(appointment, userResult.rows[0].email);
            }
            if(appointment.reminder_sms === true) {
            const customerResult = await pool.query('SELECT phone FROM customers WHERE customer_id = $1', [appointment.customer_id]);
            console.log(customerResult.rows[0].phone);
            sendSMSReminder(appointment, customerResult.rows[0].phone);
            }
          });
    } catch (error) {
        console.error('Error in checkAndSendReminders:', error);
    }
  }

  async function getUpcomingAppointments() {
    try {
      const query = `
        SELECT * FROM appointments.appointments 
        WHERE appointment_date BETWEEN NOW() AND NOW() + INTERVAL '1 HOUR' * reminder_timeframe 
        AND reminder_sent = FALSE;
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err);
      throw err;
    }
  }

  async function markReminderAsSent(appointmentId) {
    try {
        const query = `UPDATE appointments.appointments SET reminder_sent = TRUE WHERE appointment_id = $1`;
        await pool.query(query, [appointmentId]);
    } catch (err) {
        console.error('Error updating reminder_sent status:', err);
    }
}

cron.schedule('1 0 * * *', async () => {
    const campaigns = await getScheduledCampaigns();
    for (const campaign of campaigns) {
      // Send Email/SMS
      await sendCampaign(campaign);
      // Update campaign status in the database
      await markCampaignAsSent(campaign.id);
    }
  });
  
  async function getScheduledCampaigns() {
    const today = new Date().toISOString().split('T')[0];
    const query = 'SELECT * FROM campaigns WHERE send_date = $1 AND status = $2';
    const { rows } = await pool.query(query, [today, 'scheduled']);
    return rows;
  }
  
  async function sendCampaign(campaign) {
  }
  
  async function markCampaignAsSent(campaignId) {
    const updateQuery = 'UPDATE campaigns SET status = $1 WHERE id = $2';
    await pool.query(updateQuery, ['sent', campaignId]);
  }

  module.exports = router;

