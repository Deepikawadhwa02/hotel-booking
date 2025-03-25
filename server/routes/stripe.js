const express = require('express');
const stripe = require('stripe')('sk_test_51QL2ZkLrl3RaNJtSVby8dPPsimGqE4jZDMOwskG5xgcdpGIQrWFStMZnNEpG2JE8ozOFK8s1v8EFij78WmyAdbG500Xln5qJCo');

const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// Handle webhook events (optional)
router.post('/webhook', async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      'your_stripe_webhook_secret'
    );
  } catch (err) {
    console.error('Error verifying webhook event:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log(`PaymentMethod ${paymentMethod.id} was attached`);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;