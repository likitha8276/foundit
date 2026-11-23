const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['match_found', 'claim_requested', 'claim_confirmed', 'item_moderated', 'general'],
      default: 'match_found'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
