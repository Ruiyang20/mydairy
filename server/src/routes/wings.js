const express = require('express');
const Wing = require('../models/Wing');

const router = express.Router();

const DEFAULT_WINGS = [
  { roomId: 'sky', no: 'I', name: 'Sky', moods: ['happy', 'excited'], tagline: 'Bright days, momentum, and weather worth remembering.', order: 1 },
  { roomId: 'sensory', no: 'II', name: 'Sensory', moods: ['grateful'], tagline: 'Texture, food, light, touch, and small abundance.', order: 2 },
  { roomId: 'quiet', no: 'III', name: 'Quiet', moods: ['peaceful'], tagline: 'Stillness, pauses, ordinary balance.', order: 3 },
  { roomId: 'thoughts', no: 'IV', name: 'Thoughts', moods: ['melancholic', 'anxious'], tagline: 'Complicated weather inside the mind.', order: 4 },
  { roomId: 'memory', no: 'V', name: 'Memory', moods: ['nostalgic'], tagline: 'Old rooms, returning places, and soft echoes.', order: 5 },
];

const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

const slugify = (value) => {
  const slug = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40);
  return slug || `wing${Date.now()}`;
};

async function ensureDefaults() {
  const total = await Wing.countDocuments();
  if (total === 0) await Wing.insertMany(DEFAULT_WINGS);
}

router.get('/', async (req, res) => {
  try {
    await ensureDefaults();
    const wings = await Wing.find().sort({ order: 1, createdAt: 1 });
    res.json({ wings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, tagline = '', moods = [] } = req.body;
    if (!String(name || '').trim()) return res.status(400).json({ message: 'Wing name is required' });

    const count = await Wing.countDocuments();
    const baseId = slugify(name);
    let roomId = baseId;
    let suffix = 2;
    while (await Wing.exists({ roomId })) roomId = `${baseId}${suffix++}`;

    const wing = await Wing.create({
      roomId,
      no: romans[count] || String(count + 1),
      name: String(name).trim(),
      tagline: String(tagline || '').trim(),
      moods: Array.isArray(moods) ? moods : [],
      order: count + 1,
    });
    res.status(201).json(wing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:roomId', async (req, res) => {
  try {
    const { name, tagline, moods } = req.body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (tagline !== undefined) update.tagline = String(tagline || '').trim();
    if (moods !== undefined) update.moods = Array.isArray(moods) ? moods : [];

    const wing = await Wing.findOneAndUpdate(
      { roomId: req.params.roomId },
      update,
      { new: true, runValidators: true }
    );
    if (!wing) return res.status(404).json({ message: 'Wing not found' });
    res.json(wing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
