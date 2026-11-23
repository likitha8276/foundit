const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['wallet', 'phone', 'bag', 'bottle', 'keys', 'electronics', 'clothing', 'documents', 'other'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: 1000,
      trim: true
    },
    cleanedText: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: function (val) {
          return val <= new Date();
        },
        message: 'Date cannot be in the future'
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      name: {
        type: String,
        trim: true,
        default: ''
      },
      radiusMeters: {
        type: Number,
        default: 500
      }
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['lost', 'found'],
      index: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    textEmbedding: {
      type: [Number],
      select: false,
      default: undefined
    },
    imageEmbedding: {
      type: [Number],
      select: false,
      default: undefined
    },
    state: {
      type: String,
      enum: ['searching', 'matched', 'claimed', 'returned'],
      default: 'searching',
      index: true
    },
    moderation: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    },
    contact: {
      name: {
        type: String,
        trim: true,
        default: ''
      },
      phone: {
        type: String,
        trim: true,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

itemSchema.index({ status: 1, category: 1, state: 1, moderation: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ location: '2dsphere' });

itemSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.textEmbedding;
  delete obj.imageEmbedding;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Item', itemSchema);
