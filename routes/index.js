const express = require('express');
const router = express.Router();
const { convertDate } = require('../utils');
const User = require('../models/User');

router.get('/', async (req, res, next) => {
  // try {
  //   res.render('index', {
  //     title: 'voting',
  //     votes
  //   });
  // } catch (err) {
  //   next();
  // }
});

module.exports = router;
