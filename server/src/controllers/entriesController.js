const mongoose = require('mongoose');
const Entry = require('../models/Entry');

// Helper: validate MongoDB ObjectId before querying
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/entries  — list all, sorted by date desc
const getEntries = async (req, res) => {
  try {
    const { page = 1, limit = 50, mood } = req.query;
    const filter = {};
    if (mood) filter.mood = mood;

    const entries = await Entry.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Entry.countDocuments(filter);

    res.json({ entries, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/entries/:id  — single entry
const getEntry = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ message: 'Invalid entry id' });
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/entries  — create
const createEntry = async (req, res) => {
  try {
    const { title, date, mood, highlights, reflection, image } = req.body;

    const entry = new Entry({
      title,
      date: new Date(date),
      mood,
      highlights: Array.isArray(highlights) ? highlights : [],
      reflection,
      image: image || null,
    });

    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/entries/:id  — update
const updateEntry = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ message: 'Invalid entry id' });
  try {
    const { title, date, mood, highlights, reflection, image } = req.body;

    const updated = await Entry.findByIdAndUpdate(
      req.params.id,
      {
        title,
        date: date ? new Date(date) : undefined,
        mood,
        highlights: Array.isArray(highlights) ? highlights : [],
        reflection,
        image: image !== undefined ? image : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Entry not found' });
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/entries/:id
const deleteEntry = async (req, res) => {
  if (!isValidId(req.params.id))
    return res.status(400).json({ message: 'Invalid entry id' });
  try {
    const deleted = await Entry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/entries/stats  — dashboard stats
const getStats = async (req, res) => {
  try {
    const total = await Entry.countDocuments();
    const earliest = await Entry.findOne().sort({ date: 1 }).select('date');
    const latest = await Entry.findOne().sort({ date: -1 }).select('date');
    const moodBreakdown = await Entry.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } },
    ]);

    const daysSince = earliest
      ? Math.round((Date.now() - new Date(earliest.date)) / 86400000) + 1
      : 0;

    res.json({ total, daysSince, earliest, latest, moodBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEntries, getEntry, createEntry, updateEntry, deleteEntry, getStats };
