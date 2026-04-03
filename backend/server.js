require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const contentRoutes = require('./routes/content');

const app  = express();

// ── ENV ───────────────────────────────────────────────────────────────────────
// Change PORT in .env or directly here if needed
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',   // Lock down in production via .env
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Nidish LLC Content API is running 🚀' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', contentRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server listening on http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/content`);
});
