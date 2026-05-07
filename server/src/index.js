require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const connectDB      = require('./config/db');
const entriesRouter  = require('./routes/entries');
const authRouter     = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5001;

connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    const allowed = (process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter);
app.use('/api/entries', authMiddleware, entriesRouter);  // 🔒 all entry routes protected

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✦ Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ Port ${PORT} already in use. Set PORT= in .env\n`);
    process.exit(1);
  } else throw err;
});
