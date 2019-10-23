const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const chatSchema = new mongoose.Schema({
  users: [{
    type: Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: Types.ObjectId,
    ref: 'Message'
  }]
});

module.exports = mongoose.model('Chat', chatSchema);
