const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

// POST /api/auth/login
// Body: { password: string }
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password required' });
  }

  const stored = process.env.DIARY_PASSWORD_HASH;
  if (!stored) {
    return res.status(500).json({ message: 'Server not configured (missing DIARY_PASSWORD_HASH)' });
  }

  const match = await bcrypt.compare(password, stored);
  if (!match) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  const token = jwt.sign(
    { role: 'owner' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );

  res.json({ token });
});

// POST /api/auth/verify  — lightweight token check used by frontend on mount
router.post('/verify', (req, res) => {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ valid: false });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
