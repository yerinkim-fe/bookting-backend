const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares/authorization');
const User = require('../models/User');

router.get('/getUser', verifyToken, (req, res) => {
  console.log(req.headers);
  return res.send(req.user);
});

router.post('/getToken', async (req, res) => {
  const { email, name, photoURL } = req.body;

  try {
    const user = await User.findOne({
      email
    });

    if (!user) {
      await new User({
        email,
        name,
        photoURL
      }).save();
    }

    const payload = { email: user.email };
    const token = jwt.sign(payload, process.env.YOUR_SECRET_KEY);
    // console.log(token);
    res.status(200).send(token);
  } catch (err) {
    return res.status(401).send({ err });
  }
});

router.get('/protected', verifyToken, (req, res) => {
  res.send('i\'m protected');
});

module.exports = router;
