const express = require('express');
const router = express.Router();
const { register, verifyEmail, login } = require('../controllers/authController');
const {validate} = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../../../utils/validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15*60*1000, //15 min
    max: 100, //limit each ip to 100 requests per window
});

router.route('/register').post(authLimiter,validate(registerSchema),register);
router.route('/login').post(authLimiter,validate(loginSchema),login);
router.route('/verify/:token').get(verifyEmail);


module.exports = router;
