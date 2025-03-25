const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require("../models/User");

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deepalikesarwani1211@gmail.com',
    pass: 'ogal kmdo nunm ibcy'
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: 'deepalikesarwani1211@gmail.com',
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
// Multer configuration with file validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

const upload = multer({
  storage,
  // fileFilter
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Input validation middleware
const validateRegistrationInput = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next();
};

// Separate route for image upload
router.post("/upload-image", upload.single("profileImage"), async (req, res) => {
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      message: "Image uploaded successfully",
      imagePath 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: "Image upload failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user profile image
router.patch("/update-profile-image/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { imagePath } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile image if it's not the default
    if (user.profileImagePath && 
        user.profileImagePath !== '/uploads/default-profile.png' &&
        fs.existsSync(`public${user.profileImagePath}`)) {
      fs.unlinkSync(`public${user.profileImagePath}`);
    }

    user.profileImagePath = imagePath;
    await user.save();

    res.status(200).json({ 
      message: "Profile image updated successfully",
      profileImagePath: imagePath 
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({
      message: "Profile image update failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});




router.post("/register", validateRegistrationInput, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);
    

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Generate verification code and expiration date
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      profileImagePath: '/uploads/default-profile.png',
      isVerified: false,
      verificationCode: verificationCode,
      verificationCodeExpires: verificationCodeExpires,
      tripList: [],
      wishList: [],
      propertyList: [],
      reservationList: []
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "Registration successful. Please check your email for verification code.",
      userId: newUser._id,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: "Registration failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// auth.js
router.post('/verify-email', async (req, res) => {
  const { userId, verificationCode } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the required fields are present
    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ message: 'User verification data is missing' });
    }

    if (user.verificationCode !== verificationCode || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Update the user's email verification status
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* RESEND VERIFICATION CODE */
router.post("/resend-verification", async (req, res) => {
  try {
    const { userId } = req.body;


    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({
      message: "New verification code sent successfully"
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      message: "Failed to resend verification code",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/* USER LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        userId: user._id
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationCode;
    delete userResponse.verificationCodeExpires;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword,userId } = req.body;
    // const userId = req.user.id;

    // Validate user ID from token matches requested user ID
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
})

module.exports = router;