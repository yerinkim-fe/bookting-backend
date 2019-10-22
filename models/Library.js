const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const librarySchema = new mongoose.Schema({
  user_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book_id: {
    type: Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  }
});

module.exports = mongoose.model('Library', librarySchema);
