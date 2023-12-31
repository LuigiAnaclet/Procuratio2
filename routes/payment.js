
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = Stripe('sk_test_51ORIjCIP5xW4dG0qKGHifdS5KNoPtuseLlAcqubMw3JSNlzSu6w5zuhJGbw5LNqZcvovPwAIFwonxhO02OBsxmFL00HlA3T2nI'); // Set your Stripe secret key

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
  
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
