const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const CryptoJS = require('crypto-js');

exports.sendMessage = [upload.single('file'), async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const encryptedContent = CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
    const message = new Message({
      sender: req.user.id,
      recipients: [recipientId],
      content: encryptedContent,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}];

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipients: req.params.recipientId },
        { sender: req.params.recipientId, recipients: req.user.id }
      ]
    }).sort('timestamp');
    
    const decryptedMessages = messages.map(message => ({
      ...message._doc,
      content: CryptoJS.AES.decrypt(message.content, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    }));
    
    res.json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

exports.sendMessage = [upload.single('file'), async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}];