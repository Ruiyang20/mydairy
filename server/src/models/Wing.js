const mongoose = require('mongoose');

const wingSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [80, 'Wing id cannot exceed 80 characters'],
    },
    no: {
      type: String,
      required: true,
      trim: true,
      maxlength: [20, 'Wing number cannot exceed 20 characters'],
    },
    name: {
      type: String,
      required: [true, 'Wing name is required'],
      trim: true,
      maxlength: [80, 'Wing name cannot exceed 80 characters'],
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Wing tagline cannot exceed 300 characters'],
    },
    moods: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wing', wingSchema);
