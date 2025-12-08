const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 600
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Polymorphic reference - can be on question or answer
  parentType: {
    type: String,
    enum: ['Question', 'Answer'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
