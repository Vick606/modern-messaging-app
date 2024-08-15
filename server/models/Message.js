const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  fileUrl: { type: String },
  fileName: { type: String },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: { type: String },
});

module.exports = mongoose.model('Message', messageSchema);