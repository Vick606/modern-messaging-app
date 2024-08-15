const Group = require('../models/Group');
const Message = require('../models/Message');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = new Group({
      name,
      members: [...members, req.user.id],
      createdBy: req.user.id,
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'username')
      .populate('lastMessage');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve groups' });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const message = new Message({
      sender: req.user.id,
      recipients: group.members,
      content: CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString(),
      group: groupId,
    });
    await message.save();
    group.lastMessage = message._id;
    await group.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send group message' });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ group: groupId }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve group messages' });
  }
};