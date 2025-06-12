const express = require('express');
const router = express.Router();
const { register, verifyEmail, login } = require('../controllers/authController');

router.post('/register', register);
//login
router.post('/login', login);
router.get('/verify/:token', verifyEmail);


module.exports = router;
