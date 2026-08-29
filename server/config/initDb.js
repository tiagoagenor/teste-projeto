const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const UserMovie = require('../models/UserMovie');
const List = require('../models/List');
const Follower = require('../models/Follower');

async function initDb() {
  try {
    console.log('🔄 Verificando banco de dados MongoDB...');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Semeando dados iniciais no MongoDB (Usuários, Filmes, Avaliações e Listas de demonstração)...');

      const passHash = await bcrypt.hash('123456', 10);

      // Insert Demo Users
      const cinefilo = await User.create({
        name: 'Cinefilo Supremo',
        username: 'cinefilo',
        email: 'cinefilo@filmow.com',
        password_hash: passHash,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        bio: 'Apaixonado por cinema clássico, sci-fi e Nolan. Escrevo críticas diárias.'
      });

      const ana = await User.create({
        name: 'Ana Clara',
        username: 'anaclara',
        email: 'ana@filmow.com',
        password_hash: passHash,
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        bio: 'Maratonando A24 e diretores independentes.'
      });

      const lucas = await User.create({
        name: 'Lucas Silva',
        username: 'lucas_movies',
        email: 'lucas@filmow.com',
        password_hash: passHash,
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
        bio: 'Fã incondicional de Star Wars e Marvel.'
      });

      // Seed Initial Demo Movies (Dataset de 1000 filmes)
      const fs = require('fs');
      const path = require('path');
      const datasetPath = path.join(__dirname, '../data/movies_dataset_1000.json');

      let seedMovies = [];
      if (fs.existsSync(datasetPath)) {
        seedMovies = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
      }

      console.log(`📦 Semeando ${seedMovies.length} filmes no MongoDB...`);

      if (seedMovies.length > 0) {
        const bulkOps = seedMovies.map((m) => ({
          updateOne: {
            filter: { _id: m._id },
            update: { $set: m },
            upsert: true
          }
        }));
        await Movie.bulkWrite(bulkOps);
        console.log(`✨ ${seedMovies.length} filmes gravados no MongoDB com sucesso!`);
      }

      // Seed Demo User Interactions
      await UserMovie.create([
        {
          user_id: cinefilo._id,
          movie_id: 157336,
          status: 'JA_VI',
          rating: 5.0,
          review: 'Uma obra-prima absoluta sobre amor, ciência e a imensidão do tempo. A trilha sonora de Hans Zimmer é inesquecível!',
          contains_spoilers: false,
          is_favorite: true,
          watched_at: new Date('2026-01-15')
        },
        {
          user_id: cinefilo._id,
          movie_id: 27205,
          status: 'JA_VI',
          rating: 4.5,
          review: 'Complexo, eletrizante e com uma direção de arte impecável. Christopher Nolan no seu auge.',
          contains_spoilers: false,
          is_favorite: true,
          watched_at: new Date('2026-02-01')
        },
        {
          user_id: ana._id,
          movie_id: 550,
          status: 'JA_VI',
          rating: 5.0,
          review: 'A primeira regra do Clube da Luta é não falar sobre o Clube da Luta. Roteiro genial!',
          contains_spoilers: false,
          is_favorite: true,
          watched_at: new Date('2026-02-10')
        },
        {
          user_id: ana._id,
          movie_id: 157336,
          status: 'JA_VI',
          rating: 5.0,
          review: 'Chorei na cena de Cooper assistindo os vídeos dos filhos. Filmaço!',
          contains_spoilers: false,
          is_favorite: false,
          watched_at: new Date('2026-02-14')
        },
        {
          user_id: lucas._id,
          movie_id: 155,
          status: 'JA_VI',
          rating: 5.0,
          review: 'Heath Ledger entregou a maior atuação de vilão da história do cinema.',
          contains_spoilers: false,
          is_favorite: true,
          watched_at: new Date('2026-02-20')
        },
        {
          user_id: cinefilo._id,
          movie_id: 680,
          status: 'QUERO_VER'
        }
      ]);

      // Seed Followers
      await Follower.create([
        { follower_id: cinefilo._id, following_id: ana._id },
        { follower_id: cinefilo._id, following_id: lucas._id },
        { follower_id: ana._id, following_id: cinefilo._id },
        { follower_id: lucas._id, following_id: cinefilo._id }
      ]);

      // Seed Demo List
      await List.create({
        user_id: cinefilo._id,
        title: 'Top Filmes de Ficção Científica Inesquecíveis',
        description: 'Uma seleção dos meus filmes de Sci-Fi favoritos de todos os tempos.',
        is_private: false,
        movie_ids: [157336, 27205]
      });

      console.log('✅ Dados de demonstração semeados com sucesso no MongoDB!');
    }
  } catch (error) {
    console.error('❌ Erro no semeamento inicial do MongoDB:', error);
  }
}

module.exports = initDb;
