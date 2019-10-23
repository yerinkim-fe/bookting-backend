const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

router.get('/:chat_id', async (req, res, next) => {
  try {
    const { chat_id } = req.params;
    const { user_id } = req.query;

    const user = await User.findOne({ _id: user_id }).select({ name: 1, photo_url: 1, _id: 1 });

    const chats = await Chat.findOne({ _id: chat_id }).populate({
      path: 'messages',
      model: 'Message',
      populate: {
        path: 'author',
        model: 'User',
        select: { name: 1, photo_url: 1, _id: 1 },
      }
    });

    res.status(200).json({
      user,
      chats: chats.messages,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.get('/:user_id/list', async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const chats = await Chat.find({ users: { '$in': [user_id] }}, { messages: { $slice: -1 }}).populate({
      path: 'messages',
      model: 'Message',
      select: { messages: { "$slice": -1 } },
      populate: {
        path: 'author',
        model: 'User',
        select: { name: 1, photo_url: 1, _id: 1 },
      }
    });

    res.status(200).json({
      chats,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.post('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { partner_id } = req.body;

    let chatRoom = await Chat.findOne({
      $and:[ {users: user_id}, {users: partner_id} ]
    });

    if (!chatRoom) {
      chatRoom = await new Chat({
        users: [user_id, partner_id]
      }).save();
    }

    res.status(201).json({
      chatRoomId: chatRoom._id,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

router.post('/message/:chat_id', async (req, res, next) => {
  try {
    const { chat_id } = req.params;
    const { author, message } = req.body;

    const user = await User.findOne({ _id: author });

    const newMessage = await new Message({
      author,
      message
    }).save();

    await Chat.findOneAndUpdate(
      { _id: chat_id },
      { "$push": { messages: newMessage._id } }
    );

    res.status(201).json({
      user,
      result: 'ok'
    });
  } catch (error) {
    const err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
  }
});

module.exports = router;
