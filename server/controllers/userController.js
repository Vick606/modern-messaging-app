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
    const { username, bio, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username, bio, status } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};