const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    const clientToken = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(clientToken, process.env.YOUR_SECRET_KEY);


    const user = await User.findOne({
      uid: decoded.uid
    });

    if (user) {
      next();
    } else {
      throw new Error();
    }
  } catch (err) {
    res.status(401).json({ error: 'unauthorized' });
  }
}

exports.verifyToken = verifyToken;
