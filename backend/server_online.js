const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 8100;

const app = express();

app.use(cors());
app.use(express.json());

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const geoRoutes = require('./routes/geoRoutes');

// Route de santé
app.get('/', (req, res) => {
  res.json({
    application: 'AMATORA — API GRP2amiss',
    statut: 'en ligne',
    pid: process.pid,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/candidats', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/geo', geoRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AMATORA API démarrée sur le port ${PORT}`);
});
