const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const wishSchema = new mongoose.Schema({
  user_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: Types.ObjectId,
    ref: 'Library',
    required: true,
  }
});

module.exports = mongoose.model('Wish', wishSchema);
