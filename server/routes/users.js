const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { updateStatus } = require('../controllers/statusController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/status', auth, updateStatus);

module.exports = router;