import express from 'express';
import Recipe from '../models/Recipe.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/recipes - Get all recipes for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: req.user.userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Recipe.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes'
    });
  }
});

// GET /api/recipes/:id - Get single recipe
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      data: { recipe }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe'
    });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', verifyToken, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      user: req.user.userId
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipe }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating recipe'
    });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: { recipe }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating recipe'
    });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe'
    });
  }
});

export default router;
