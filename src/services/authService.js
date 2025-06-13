const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { envConfig } = require('../config/env');

const authService = {
  register: async ({ name, email, password, organizationName, organizationEmail, baseUrl }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const orgExists = await User.findOne({ organizationName });
    if (orgExists) {
      throw new AppError('Organization name already in use', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      organizationName,
      organizationEmail,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    const verifyUrl = `${baseUrl}/api/v1/auth/verify/${verificationToken}`;
    const html = `
      <h2>Welcome, ${name}</h2>
      <p>Click the link below to verify your email (expires in 24 hours):</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;

    await sendEmail(email, 'Verify your account', html);
    return verificationToken;
  },

  verifyEmail: async (token) => {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email before logging in', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, organization: user.organizationName },
      envConfig.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = user.toObject();
    delete userData.password;
    return { token, user: userData };
  },
};

module.exports = authService;