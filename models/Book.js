const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
  },
  authors: {
    type: Array,
    required: true
  },
  pubdate: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
  },
  publisher: {
    type: String,
  }
});

module.exports = mongoose.model('Book', bookSchema);
