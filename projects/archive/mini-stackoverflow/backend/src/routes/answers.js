const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Vote = require('../models/Vote');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', verifyToken, async (req, res) => {
  try {
    const { body, questionId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const answer = new Answer({
      body,
      author: req.userId,
      question: questionId
    });

    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, { $inc: { answersCount: 1 } });

    const populated = await answer.populate('author', 'username reputation');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ success: false, message: 'Invalid vote value' });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.author.toString() === req.userId) {
      return res.status(400).json({ success: false, message: 'Cannot vote on your own answer' });
    }

    const existingVote = await Vote.findOne({
      user: req.userId,
      targetType: 'Answer',
      targetId: answer._id
    });

    let voteChange = 0;
    let reputationChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        await existingVote.deleteOne();
        voteChange = -value;
        reputationChange = value === 1 ? -10 : 2;
      } else {
        existingVote.value = value;
        await existingVote.save();
        voteChange = value * 2;
        reputationChange = value === 1 ? 12 : -12;
      }
    } else {
      await Vote.create({
        user: req.userId,
        targetType: 'Answer',
        targetId: answer._id,
        value
      });
      voteChange = value;
      reputationChange = value === 1 ? 10 : -2;
    }

    answer.votes += voteChange;
    if (value === 1) {
      answer.upvoters = existingVote?.value === 1
        ? answer.upvoters.filter(id => id.toString() !== req.userId)
        : [...answer.upvoters, req.userId];
      answer.downvoters = answer.downvoters.filter(id => id.toString() !== req.userId);
    } else {
      answer.downvoters = existingVote?.value === -1
        ? answer.downvoters.filter(id => id.toString() !== req.userId)
        : [...answer.downvoters, req.userId];
      answer.upvoters = answer.upvoters.filter(id => id.toString() !== req.userId);
    }
    await answer.save();

    const author = await User.findById(answer.author);
    await author.updateReputation(reputationChange);

    res.json({ success: true, data: { votes: answer.votes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update answer
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    answer.body = req.body.body;
    await answer.save();

    res.json({ success: true, data: answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete answer
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove from question
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
      $unset: answer.isAccepted ? { acceptedAnswer: 1 } : {}
    });

    // Delete votes
    await Vote.deleteMany({ targetType: 'Answer', targetId: answer._id });

    await answer.deleteOne();

    await User.findByIdAndUpdate(req.userId, { $inc: { answersCount: -1 } });

    res.json({ success: true, message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
