const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's questions and answers
    const [questions, answers] = await Promise.all([
      Question.find({ author: user._id })
        .select('title votes createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      Answer.find({ author: user._id })
        .populate('question', 'title')
        .select('votes isAccepted createdAt question')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        user,
        questions,
        answers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top users by reputation
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('username reputation questionsCount answersCount')
      .sort({ reputation: -1 })
      .limit(20);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
