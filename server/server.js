const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const initDb = require('./config/initDb');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend files from client build if exists
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback SPA Middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) {
        return res.status(200).send('🎬 Server do Filmow Clone rodando na porta ' + PORT + '! API ativa em /api');
      }
    });
  }
  next();
});

// Start Server & Initialize Database
app.listen(PORT, async () => {
  console.log(`\n🚀 Servidor do Filmow Clone rodando na porta ${PORT}`);
  console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
  await connectDB();
  await initDb();
});

