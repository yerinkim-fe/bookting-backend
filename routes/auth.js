const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares/authorization');
const User = require('../models/User');

router.get('/getUser', verifyToken, (req, res, next) => {
  return res.status(200).json({
    user: res.user
  });
});

router.post('/getToken', async (req, res, next) => {
  const { uid, name, email, photo_url } = req.body;

  try {
    const user = await User.findOne({
      uid
    });

    if (!user) {
      user = await new User({
        uid,
        name,
        email,
        photo_url
      }).save();
    }

    const payload = { uid };
    const token = jwt.sign(payload, process.env.YOUR_SECRET_KEY);
    res.status(200).json({
      token,
      id: user._id
    });
  } catch (err) {
    return res.status(401).send({ err });
  }
});

module.exports = router;
