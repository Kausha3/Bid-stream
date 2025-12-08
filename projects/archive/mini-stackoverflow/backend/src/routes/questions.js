const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Vote = require('../models/Vote');
const { verifyToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions with pagination and filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'newest', tag, search } = req.query;

    const query = { isClosed: false };

    if (tag) {
      const tagDoc = await Tag.findOne({ name: tag.toLowerCase() });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'votes') sortOption = { votes: -1, createdAt: -1 };
    if (sort === 'unanswered') {
      query.answers = { $size: 0 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation')
      .populate('tags', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single question with answers
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username reputation')
      .populate('tags', 'name')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username reputation' },
        options: { sort: { isAccepted: -1, votes: -1, createdAt: 1 } }
      });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if current user has voted
    let userVote = null;
    if (req.userId) {
      const vote = await Vote.findOne({
        user: req.userId,
        targetType: 'Question',
        targetId: question._id
      });
      userVote = vote?.value || null;
    }

    res.json({ success: true, data: { ...question.toObject(), userVote } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create question
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    // Find or create tags
    const tagIds = await Promise.all(
      tags.map(async (tagName) => {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({ name: tagName.toLowerCase() });
          await tag.save();
        }
        await tag.incrementCount();
        return tag._id;
      })
    );

    const question = new Question({
      title,
      body,
      author: req.userId,
      tags: tagIds
    });

    await question.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, { $inc: { questionsCount: 1 } });

    const populated = await question.populate([
      { path: 'author', select: 'username reputation' },
      { path: 'tags', select: 'name' }
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vote on question
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { value } = req.body; // 1 for upvote, -1 for downvote
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ success: false, message: 'Invalid vote value' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Can't vote on own question
    if (question.author.toString() === req.userId) {
      return res.status(400).json({ success: false, message: 'Cannot vote on your own question' });
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      user: req.userId,
      targetType: 'Question',
      targetId: question._id
    });

    let voteChange = 0;
    let reputationChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        await existingVote.deleteOne();
        voteChange = -value;
        reputationChange = value === 1 ? -10 : 2;
      } else {
        // Change vote
        existingVote.value = value;
        await existingVote.save();
        voteChange = value * 2;
        reputationChange = value === 1 ? 12 : -12;
      }
    } else {
      // New vote
      await Vote.create({
        user: req.userId,
        targetType: 'Question',
        targetId: question._id,
        value
      });
      voteChange = value;
      reputationChange = value === 1 ? 10 : -2;
    }

    // Update question votes
    question.votes += voteChange;
    if (value === 1) {
      question.upvoters = existingVote?.value === 1
        ? question.upvoters.filter(id => id.toString() !== req.userId)
        : [...question.upvoters, req.userId];
      question.downvoters = question.downvoters.filter(id => id.toString() !== req.userId);
    } else {
      question.downvoters = existingVote?.value === -1
        ? question.downvoters.filter(id => id.toString() !== req.userId)
        : [...question.downvoters, req.userId];
      question.upvoters = question.upvoters.filter(id => id.toString() !== req.userId);
    }
    await question.save();

    // Update author reputation
    const author = await User.findById(question.author);
    await author.updateReputation(reputationChange);

    res.json({ success: true, data: { votes: question.votes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept answer
router.post('/:id/accept/:answerId', verifyToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only question author can accept answer' });
    }

    // Unaccept previous answer if exists
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
      const prevAuthor = await Answer.findById(question.acceptedAnswer);
      if (prevAuthor) {
        const user = await User.findById(prevAuthor.author);
        await user.updateReputation(-15);
      }
    }

    // Accept new answer
    const answer = await Answer.findById(req.params.answerId);
    if (!answer || answer.question.toString() !== question._id.toString()) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    // Award reputation to answer author
    const answerAuthor = await User.findById(answer.author);
    await answerAuthor.updateReputation(15);

    res.json({ success: true, data: { acceptedAnswer: answer._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
