const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking'); // Adjust path as needed

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { 
      amount, 
      currency, 
      customerId, 
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice 
    } = req.body;

    // Create a shorter receipt ID
    const shortReceipt = `book_${Date.now().toString().slice(-8)}`;

    const options = {
      amount,
      currency,
      receipt: shortReceipt,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);

    // Create booking with pending status
    const booking = await Booking.create({
      customerId,
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice,
      orderId: order.id,
      paymentStatus: 'pending'
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      bookingId // Add this to the frontend payload
    } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Update booking status
      const booking = await Booking.findOneAndUpdate(
        { _id: bookingId },
        { 
          paymentStatus: 'completed',
          paymentId: razorpay_payment_id,
          paymentSignature: razorpay_signature
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({ 
        success: true,
        message: 'Payment verified successfully',
        booking
      });
    } else {
      // Update booking status to failed
      await Booking.findOneAndUpdate(
        { _id: bookingId },
        { paymentStatus: 'failed' }
      );

      res.json({ 
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;