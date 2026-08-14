const express = require('express');
const cors = require('cors');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const NUM_CPUS = os.cpus().length;
const NUM_WORKERS = Math.min(NUM_CPUS, 4); // Jusqu'à 4 workers
const MAX_RESTARTS = 3;

// ============================================================
//  PROCESSUS MASTER — Gestion du Cluster Computing
// ============================================================
if (cluster.isPrimary) {
  let restartCount = 0;
  const startTime = Date.now();

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     AMATORA — Cluster Computing Backend      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  🖥️  Système       : ${os.type()} ${os.release()} (${os.arch()})`);
  console.log(`  🧠  CPUs          : ${NUM_CPUS} cœurs (${os.cpus()[0].model})`);
  console.log(`  💾  RAM totale    : ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} Go`);
  console.log(`  💾  RAM libre     : ${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} Go`);
  console.log(`  👷  Workers       : ${NUM_WORKERS}`);
  console.log(`  🚀  Master PID    : ${process.pid}`);
  console.log(`  🌐  Port          : ${PORT}`);
  console.log('──────────────────────────────────────────────');

  // Lancement des workers
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork();
    console.log(`  ✅ Worker #${i + 1} lancé (PID ${worker.process.pid})`);
  }

  // Gestion de la sortie des workers
  cluster.on('exit', (worker, code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    if (code !== 0 && restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`  ⚠️  Worker ${worker.process.pid} arrêté (${reason}). Redémarrage ${restartCount}/${MAX_RESTARTS}...`);
      setTimeout(() => {
        const newWorker = cluster.fork();
        console.log(`  🔄 Nouveau worker lancé (PID ${newWorker.process.pid})`);
      }, 2000);
    } else if (code === 0) {
      console.log(`  ℹ️  Worker ${worker.process.pid} terminé proprement.`);
    } else {
      console.error(`  ❌ Worker ${worker.process.pid} crash. Limite de redémarrages atteinte.`);
      console.error(`     Essayez : taskkill /F /IM node.exe  puis relancez.`);
      // Si tous les workers sont morts, arrêter le master
      if (Object.keys(cluster.workers).length === 0) {
        process.exit(1);
      }
    }
  });

  // Statistiques périodiques (toutes les 60s)
  setInterval(() => {
    const uptime = Math.round((Date.now() - startTime) / 1000);
    const activeWorkers = Object.keys(cluster.workers).length;
    const mem = process.memoryUsage();
    console.log(`  📊 [${new Date().toLocaleTimeString()}] Uptime: ${uptime}s | Workers actifs: ${activeWorkers}/${NUM_WORKERS} | RAM Master: ${(mem.rss / 1024 / 1024).toFixed(1)} Mo`);
  }, 60000);

// ============================================================
//  PROCESSUS WORKER — Serveur Express
// ============================================================
} else {
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
      application: 'AMATORA — API de démonstration',
      avertissement: "Ceci est un prototype pédagogique. Il ne représente aucun scrutin réel et n'a aucun caractère officiel.",
      statut: 'en ligne',
      worker_pid: process.pid,
    });
  });

  // Endpoint de statut du cluster
  app.get('/api/cluster/status', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
      success: true,
      cluster: {
        architecture: os.arch(),
        plateforme: os.type(),
        cpus_total: NUM_CPUS,
        workers_configures: NUM_WORKERS,
        worker_actuel_pid: process.pid,
        ram_totale_go: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
        ram_libre_go: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
        ram_worker_mo: (mem.rss / 1024 / 1024).toFixed(2),
        uptime_systeme_heures: (os.uptime() / 3600).toFixed(1),
      },
      technologies: {
        runtime: `Node.js ${process.version}`,
        framework: 'Express.js',
        cluster: 'Node.js Cluster Module',
        base_de_donnees: 'MySQL (mysql2/promise)',
        authentification: 'JWT (jsonwebtoken) + bcryptjs',
        mobile: 'React Native + Expo SDK 51',
      },
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

  app.listen(PORT, () => {
    console.log(`  ✅ Worker ${process.pid} prêt sur le port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`  ❌ Port ${PORT} déjà utilisé. Worker ${process.pid} s'arrête.`);
      process.exit(1);
    }
  });
}
