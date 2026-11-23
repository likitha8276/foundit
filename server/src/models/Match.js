const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true
    },
    textScore: {
      type: Number,
      default: 0
    },
    imageScore: {
      type: Number,
      default: 0
    },
    finalScore: {
      type: Number,
      required: true,
      index: true
    },
    state: {
      type: String,
      enum: ['suggested', 'claimed', 'confirmed', 'rejected'],
      default: 'suggested',
      index: true
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
