const express = require('express');
const router = express.Router();
const { createGroup, getGroups, sendGroupMessage, getGroupMessages } = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.post('/', auth, createGroup);
router.get('/', auth, getGroups);
router.post('/:groupId/messages', auth, sendGroupMessage);
router.get('/:groupId/messages', auth, getGroupMessages);

module.exports = router;