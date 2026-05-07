const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    mood: {
      type: String,
      enum: ['happy', 'melancholic', 'excited', 'grateful', 'anxious', 'peaceful', 'nostalgic'],
      default: 'peaceful',
    },
    highlights: {
      type: [String],
      default: [],
    },
    reflection: {
      type: String,
      default: '',
      maxlength: [5000, 'Reflection cannot exceed 5000 characters'],
    },
    // Stored as base64 data URL (small images) or file path
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Virtual: entry number based on sort order (computed at query time, not stored)
entrySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

entrySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Entry', entrySchema);
