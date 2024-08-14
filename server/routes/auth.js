const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');

router.post('/register', register);
router.post('/login', login);


router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

module.exports = router;