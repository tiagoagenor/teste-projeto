const initDb = require('../config/initDb');
const pool = require('../config/db');

async function runMigration() {
  console.log('🚀 Executando migration do banco de dados MySQL...');
  try {
    await initDb();
    console.log('🎉 Migration concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a execução da migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
