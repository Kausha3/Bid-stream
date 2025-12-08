const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  questionsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Increment/decrement question count
tagSchema.methods.incrementCount = async function() {
  this.questionsCount += 1;
  await this.save();
};

tagSchema.methods.decrementCount = async function() {
  this.questionsCount = Math.max(0, this.questionsCount - 1);
  await this.save();
};

module.exports = mongoose.model('Tag', tagSchema);
