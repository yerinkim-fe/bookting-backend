const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const messageSchema = new mongoose.Schema({
  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
},
{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Message', messageSchema);
