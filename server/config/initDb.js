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

      // Seed Initial Demo Movies
      const seedMovies = [
        {
          _id: 157336,
          title: 'Interestelar',
          original_title: 'Interstellar',
          poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
          backdrop_path: '/xJHokMbljvjADYdit5fKSuV0Te.jpg',
          overview: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar quais planetas oferecem condições para a sobrevivência da espécie humana. Cooper é chamado para liderar o grupo.',
          release_date: '2014-11-05',
          runtime: 169,
          vote_average: 8.4,
          vote_count: 34500,
          genres: [{ id: 878, name: 'Ficção Científica' }, { id: 18, name: 'Drama' }, { id: 12, name: 'Aventura' }]
        },
        {
          _id: 27205,
          title: 'A Origem',
          original_title: 'Inception',
          poster_path: '/oYuLEIVWz2OiuhyCY7cW2q33xev.jpg',
          backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
          overview: 'Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente durante o estado de sono. Impedido de retornar para sua família, ele recebe uma oportunidade de redenção.',
          release_date: '2010-07-15',
          runtime: 148,
          vote_average: 8.4,
          vote_count: 35000,
          genres: [{ id: 878, name: 'Ficção Científica' }, { id: 28, name: 'Ação' }, { id: 12, name: 'Aventura' }]
        },
        {
          _id: 155,
          title: 'Batman: O Cavaleiro das Trevas',
          original_title: 'The Dark Knight',
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          backdrop_path: '/nMK2819TyqLnTFiCBD9oYGi2qOp.jpg',
          overview: 'Após dois anos desde o surgimento do Batman, o crime organizado em Gotham City foi encurralado por Batman, o Tenente James Gordon e o novo Promotor de Justiça Harvey Dent.',
          release_date: '2008-07-16',
          runtime: 152,
          vote_average: 8.5,
          vote_count: 32000,
          genres: [{ id: 18, name: 'Drama' }, { id: 28, name: 'Ação' }, { id: 80, name: 'Crime' }]
        },
        {
          _id: 550,
          title: 'Clube da Luta',
          original_title: 'Fight Club',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          backdrop_path: '/hZkgoQY85KGWFToRHub4ee1wY3C.jpg',
          overview: 'Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabão chamado Tyler Durden e se vê morando em uma casa caindo aos pedaços.',
          release_date: '1999-10-15',
          runtime: 139,
          vote_average: 8.4,
          vote_count: 28000,
          genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }]
        },
        {
          _id: 680,
          title: 'Pulp Fiction: Tempo de Violência',
          original_title: 'Pulp Fiction',
          poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
          backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfNIk.jpg',
          overview: 'As vidas de dois assassinos da máfia, um boxeador, a esposa de um gângster e um par de assaltantes se entrelaçam em quatro histórias de violência e redenção.',
          release_date: '1994-09-10',
          runtime: 154,
          vote_average: 8.5,
          vote_count: 27000,
          genres: [{ id: 53, name: 'Thriller' }, { id: 80, name: 'Crime' }]
        },
        {
          _id: 238,
          title: 'O Padrinho',
          original_title: 'The Godfather',
          poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          backdrop_path: '/rSPw7tgCH9c6NqICZefy2aUMqC.jpg',
          overview: 'Em 1945, Don Vito Corleone é o chefe de uma família da máfia nova-iorquina. Quando um rival decide vender drogas em Nova Iorque, Don Vito recusa apoiar o negócio.',
          release_date: '1972-03-14',
          runtime: 175,
          vote_average: 8.7,
          vote_count: 19000,
          genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }]
        }
      ];

      for (const m of seedMovies) {
        await Movie.findByIdAndUpdate(m._id, m, { upsert: true, new: true });
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
