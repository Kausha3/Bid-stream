const express = require('express');
const Tag = require('../models/Tag');

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const tags = await Tag.find(query)
      .sort({ questionsCount: -1 })
      .limit(50);

    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const tags = await Tag.find()
      .sort({ questionsCount: -1 })
      .limit(10);

    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tag by name
router.get('/:name', async (req, res) => {
  try {
    const tag = await Tag.findOne({ name: req.params.name.toLowerCase() });

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
