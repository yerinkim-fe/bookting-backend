// const User = require('../../models/User');
const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {
  try {
    const clientToken = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(clientToken, process.env.YOUR_SECRET_KEY);

    if (decoded) {
      res.locals.email = decoded.email;
      next();
    } else {
      res.status(401).json({ error: 'unauthorized' });
    }
  } catch (err) {
    res.status(401).json({ error: 'token expired' });
  }
}

exports.verifyToken = verifyToken;
