const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    djId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'djs',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: [],
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('reviews', reviewSchema);
