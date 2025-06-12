const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, organizationName, organizationEmail } = req.body;

    // Validate input
    if (!name || !email || !password || !organizationName || !organizationEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if organization name already used by another user
    const orgExists = await User.findOne({ organizationName });
    if (orgExists) {
      return res.status(400).json({ message: 'Organization name already in use' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      organizationName,
      organizationEmail,
      verificationToken,
      isVerified: false,
    });

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const html = `
      <h2>Welcome, ${name}</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;

    await sendEmail(email, 'Verify your account', html);

    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed.' });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
     
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }
     
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }


    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        organization: user.organizationName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
     const userData = user.toObject();
      delete userData.password;
    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user:userData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error in login API',
      error,
    });
  }
};

