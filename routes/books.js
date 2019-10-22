const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Library = require('../models/Library');
const Wish = require('../models/Wish');
const jwt = require('jsonwebtoken');
const perPage = 10;

router.get('/', async (req, res) => {
  try {
    const { page, query } = req.query;

    let allBooks;

    if (query !== '') {
      const searchedBooks = await Book.find({
        $or:[ {title: { $regex: query }}, {authors: { $regex: query }} ]
      });

      const bookArr = searchedBooks.map(async book => {
        return await Library.findOne({ book_id: book._id });
      });

      const result = await Promise.all(bookArr);
      allBooks = result.filter(book => book !== null);
    } else {
      allBooks = await Library.find({}).skip((page * perPage)).limit(perPage);
    }

    console.log(allBooks.length);

    const isEnd = (allBooks.length) ? false : true;

    const bookArr = allBooks.map(async book => {
      const result = await Book.findOne({
        _id: book.book_id
      });
      const owner = await User.findOne({
        _id: book.user_id
      });

      const obj = { ...result._doc, owner, status: book.status, lib_id: book._id };

      return obj;
    });

    const books = await Promise.all(bookArr);

    res.status(200).json({
      books,
      isEnd,
      result: 'ok'
    });

  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;

    // const books = await Library.find({ user_id: id }).populate('book_id').skip((page * perPage)).limit(perPage);
    const myBooks = await Library.find({ user_id: id }).skip((page * perPage)).limit(perPage);

    const isEnd = (myBooks.length) ? false : true;

    const bookArr = myBooks.map(async book => {
      const result = await Book.findOne({
        _id: book.book_id
      });
      const obj = { ...result._doc, status: book.status };

      return obj;
    });

    const books = await Promise.all(bookArr);

    res.status(200).json({
      books,
      isEnd,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedBook } = req.body;

    const lib = await Library.findOne({ user_id: id, book_id: selectedBook }, {});

    await Library.findOneAndUpdate({ user_id: id, book_id: selectedBook }, { status: !lib.status });

    res.status(200).json({
      message: '수정되었습니다.',
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedBook } = req.body;

    await Library.findOneAndDelete({ user_id: id, book_id: selectedBook });

    const result = await Library.find({ book_id: selectedBook });

    if (!result) {
      await Book.findOneAndDelete({ _id: selectedBook });
    }

    res.status(200).json({
      message: '삭제되었습니다.',
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.post('/new/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedBook } = req.body;

    let newBook = await Book.findOne({ isbn: selectedBook.isbn });

    if (!newBook) {
      newBook = await new Book(selectedBook).save();
    }

    const library = await Library.find({ user_id: id, book_id: newBook._id });

    if (!library.length) {
      const data = {
        user_id: id,
        book_id: String(newBook._id),
        status: false
      }

      await new Library(data).save();

      res.status(201).json({
        message: '등록되었습니다.',
        result: 'ok'
      });
    } else {
      res.status(201).json({
        message: '이미 등록된 책입니다.',
        result: 'ok'
      });
    }
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.get('/wish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;

    const myBooks = await Wish.find({ user_id: id }).skip((page * perPage)).limit(perPage);

    const isEnd = (myBooks.length) ? false : true;

    const bookArr = myBooks.map(async wish => {
      const result = await Library.findOne({
        _id: wish.book
      });

      const owner = await User.findOne({
        _id: result.user_id
      });

      const book = await Book.findOne({
        _id: result.book_id
      });

      const obj = { owner, book, wishId: wish._id };

      return obj;
    });

    const result = await Promise.all(bookArr);

    let books = Object.values(result.reduce((acc, {owner, book, wishId}) => {
      acc[owner] = acc[owner] || {owner, book: []};
      acc[owner].book.push(book);
      acc[owner].wishId = wishId;
      return acc;
    }, {}));

    res.status(200).json({
      books,
      isEnd,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.post('/wish', async (req, res) => {
  try {
    const clientToken = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(clientToken, process.env.YOUR_SECRET_KEY);

    const { uid } = decoded;
    const { selectedBook } = req.body;

    const user = await User.findOne({ uid });
    const wish = await Wish.find({ book: selectedBook });

    if (!wish.length) {
      const data = {
        user_id: user._id,
        book: selectedBook
      }

      await new Wish(data).save();

      res.status(201).json({
        message: '등록되었습니다.',
        result: 'ok'
      });
    } else {
      res.status(201).json({
        message: '이미 등록된 책입니다.',
        result: 'ok'
      });
    }
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.delete('/wish/:id', async (req, res) => {
  try {
    const { selectedBook } = req.body;

    await Wish.findOneAndDelete({ _id: selectedBook });

    res.status(200).json({
      message: '삭제되었습니다.',
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

module.exports = router;
