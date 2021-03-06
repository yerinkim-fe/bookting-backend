if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const cors = require("cors");
const auth = require('./routes/auth');
const kakao = require('./routes/kakao');
const books = require('./routes/books');
const chats = require('./routes/chats');

const CLIENT_URL = (process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : 'https://bookting.yerinsite.com';

const app = express();

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('we are connected!');
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24000 * 60 * 60 * 7
  }
}));

app.use(
  cors({
    origin: CLIENT_URL,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true
  })
);

app.use('/api/auth', auth);
app.use('/api/kakao', kakao);
app.use('/api/books', books);
app.use('/api/chats', chats);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({ status: `${err.status}`, message: `${err.message}`});
});

module.exports = app;
