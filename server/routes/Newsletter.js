const express = require('express');
const router = express.Router();
const validator = require('email-validator');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Subscriber = require('../models/subscriberSchema');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deepalikesarwani1211@gmail.com',
    pass: 'ogal kmdo nunm ibcy' // Use App Password for Gmail
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: "Your Company Name Stay Vista",
      to: email,
      subject: 'Welcome to Our Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Welcome to Our Newsletter!</h1>
          <p style="color: #666;">Thank you for subscribing to our newsletter.</p>
          <p style="color: #666;">Stay tuned for the latest updates, news, and exclusive offers.</p>
        </div>
      `,
      text: `Welcome to Our Newsletter!\n\nThank you for subscribing. Stay tuned for updates and exclusive offers.`
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Function to send monthly newsletter
const sendMonthlyNewsletter = async () => {
  try {
    // Fetch all active subscribers
    const subscribers = await Subscriber.find({ isActive: true });
    if (!subscribers.length) {
      console.log('No active subscribers to send the newsletter to.');
      return;
    }

    // Send the newsletter to all subscribers
    for (const subscriber of subscribers) {
      await transporter.sendMail({
        from: "Your Company Name Stay Vista",
        to: subscriber.email,
        subject: 'Monthly Newsletter - Updates & Offers!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Monthly Newsletter</h1>
            <p style="color: #666;">Here are the latest updates and exclusive offers just for you!</p>
            <p style="color: #666;">Stay connected with us for more exciting news.</p>
          </div>
        `,
        text: `Monthly Newsletter\n\nHere are the latest updates and exclusive offers just for you! Stay connected with us for more news.`
      });
    }

    console.log('Monthly newsletter sent to all active subscribers.');
  } catch (error) {
    console.error('Error sending monthly newsletter:', error);
  }
};

// Schedule the monthly newsletter (1st day of every month at 8:00 AM)
cron.schedule('0 8 1 * *', () => {
  console.log('Running scheduled task: Sending monthly newsletter...');
  sendMonthlyNewsletter();
});

// Subscribe Route
router.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validator.validate(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already subscribed' 
      });
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email);

    res.status(201).json({ 
      success: true, 
      message: 'Successfully subscribed to our newsletter!' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

// Unsubscribe Route
router.post('/api/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validator.validate(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Find and update subscriber
    const updatedSubscriber = await Subscriber.findOneAndUpdate(
      { email },
      { isActive: false },
      { new: true }
    );

    if (!updatedSubscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found in our subscription list' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Successfully unsubscribed from our newsletter.' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

module.exports = router;
