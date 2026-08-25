const connectDB = require('../config/db');
const initDb = require('../config/initDb');
const mongoose = require('mongoose');

async function runMigration() {
  console.log('🚀 Executando inicialização/semeamento do MongoDB...');
  try {
    await connectDB();
    await initDb();
    console.log('🎉 Inicialização concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runMigration();
