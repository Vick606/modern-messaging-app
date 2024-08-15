const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  status: { type: String, default: 'online' },
  lastActive: { type: Date, default: Date.now },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
  avatar: { type: String, default: '' },
  settings: {
    darkMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    soundNotifications: { type: Boolean, default: true },
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);