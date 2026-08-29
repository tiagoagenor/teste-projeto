const connectDB = require('../config/db');
const initDb = require('../config/initDb');
const Movie = require('../models/Movie');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function seed1000Movies() {
  console.log('🚀 Iniciando script de migração para 1000 filmes no MongoDB...');
  try {
    await connectDB();

    const datasetPath = path.join(__dirname, '../data/movies_dataset_1000.json');
    if (!fs.existsSync(datasetPath)) {
      console.error('❌ Dataset movies_dataset_1000.json não encontrado!');
      process.exit(1);
    }

    const movies = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    console.log(`📦 Encontrados ${movies.length} filmes no dataset.`);

    const bulkOps = movies.map((m) => ({
      updateOne: {
        filter: { _id: m._id },
        update: { $set: m },
        upsert: true
      }
    }));

    await Movie.bulkWrite(bulkOps);
    console.log(`🎉 Migração concluída! Foram populados/atualizados ${movies.length} filmes no MongoDB.`);

    // Garantir que os usuários de demonstração também existam
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await initDb();
    }

    const totalCount = await Movie.countDocuments();
    console.log(`📊 Total atual de filmes no banco de dados: ${totalCount}`);
  } catch (error) {
    console.error('❌ Erro ao semear filmes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed1000Movies();
