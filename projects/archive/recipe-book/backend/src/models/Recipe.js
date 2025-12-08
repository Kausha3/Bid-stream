import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      trim: true
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  }],
  cookTime: {
    type: Number, // in minutes
    min: [0, 'Cook time cannot be negative']
  },
  prepTime: {
    type: Number, // in minutes
    min: [0, 'Prep time cannot be negative']
  },
  servings: {
    type: Number,
    min: [1, 'Servings must be at least 1']
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other'],
    default: 'other'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  imageUrl: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
recipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Recipe', recipeSchema);
