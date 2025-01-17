const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username, email, bio, avatar } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings: req.body } },
      { new: true }
    ).select('settings');
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { friends: req.params.id } },
      { new: true }
    );
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add friend' });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { friends: req.params.id } },
      { new: true }
    );
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username isOnline');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get friends' });
  }
};