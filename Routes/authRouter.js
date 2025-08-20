const express = require('express');
const { register, login, googleSignup, sendVerificationCode, forgotPassword, resetPassword } = require('../Controller/authController');

const authRouter = express.Router();

authRouter.route('/send-verification-code').post(sendVerificationCode)
authRouter.route('/register').post(register);
authRouter.route('/login').post(login)
    
authRouter.route('/google').post(googleSignup)

authRouter.route('/forgot-password').post(forgotPassword)
authRouter.route('/reset-password').post(resetPassword)

module.exports = authRouter