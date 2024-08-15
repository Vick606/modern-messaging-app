const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    getSettings, 
    updateSettings,
    addFriend,
    removeFriend,
    getFriends
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { updateStatus } = require('../controllers/statusController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/status', auth, updateStatus);
router.get('/settings', auth, getSettings);
router.put('/settings', auth, updateSettings);
router.post('/friends/:id', auth, addFriend);
router.delete('/friends/:id', auth, removeFriend);
router.get('/friends', auth, getFriends);

module.exports = router;