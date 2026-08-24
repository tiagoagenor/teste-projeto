const pool = require('./db');
const bcrypt = require('bcryptjs');

async function initDb() {
  try {
    console.log('🔄 Inicializando estrutura de tabelas do MySQL...');

    // 1. Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Movies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        original_title VARCHAR(255) DEFAULT NULL,
        poster_path VARCHAR(500) DEFAULT NULL,
        backdrop_path VARCHAR(500) DEFAULT NULL,
        overview TEXT DEFAULT NULL,
        release_date VARCHAR(20) DEFAULT NULL,
        runtime INT DEFAULT 120,
        vote_average DECIMAL(3,1) DEFAULT 0.0,
        vote_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Genres
    await pool.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id INT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Movie Genres
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movie_genres (
        movie_id INT NOT NULL,
        genre_id INT NOT NULL,
        PRIMARY KEY (movie_id, genre_id),
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. User Movies (Já vi, Quero ver, Vendo, Abandonei, Ratings, Reviews, Favorito)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        movie_id INT NOT NULL,
        status ENUM('JA_VI', 'QUERO_VER', 'VENDO', 'ABANDONEI') NOT NULL DEFAULT 'JA_VI',
        rating DECIMAL(2,1) DEFAULT NULL,
        review TEXT DEFAULT NULL,
        contains_spoilers BOOLEAN DEFAULT FALSE,
        is_favorite BOOLEAN DEFAULT FALSE,
        watched_at DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_movie (user_id, movie_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Lists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT DEFAULT NULL,
        is_private BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. List Movies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS list_movies (
        list_id INT NOT NULL,
        movie_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (list_id, movie_id),
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. User Followers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_followers (
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Likes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_type ENUM('REVIEW', 'LIST', 'COMMENT') NOT NULL,
        target_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_like (user_id, target_type, target_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Comments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_type ENUM('REVIEW', 'LIST') NOT NULL,
        target_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Estrutura de tabelas MySQL verificada/criada com sucesso!');

    // Seed default data if users table is empty
    const [userRows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Semeando dados iniciais no MySQL (Usuários, Filmes e Avaliações de demonstração)...');
      
      const passHash = await bcrypt.hash('123456', 10);
      
      // Insert Demo Users
      await pool.query(`
        INSERT INTO users (name, username, email, password_hash, avatar_url, bio) VALUES
        ('Cinefilo Supremo', 'cinefilo', 'cinefilo@filmow.com', ?, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 'Apaixonado por cinema clássico, sci-fi e Nolan. Escrevo críticas diárias.'),
        ('Ana Clara', 'anaclara', 'ana@filmow.com', ?, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Maratonando A24 e diretores independentes.'),
        ('Lucas Silva', 'lucas_movies', 'lucas@filmow.com', ?, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', 'Fã incondicional de Star Wars e Marvel.')
      `, [passHash, passHash, passHash]);

      // Seed Initial Genres
      const initialGenres = [
        [28, 'Ação'], [12, 'Aventura'], [16, 'Animação'], [35, 'Comédia'],
        [80, 'Crime'], [99, 'Documentário'], [18, 'Drama'], [10751, 'Família'],
        [14, 'Fantasia'], [36, 'História'], [27, 'Terror'], [10402, 'Música'],
        [9648, 'Mistério'], [10749, 'Romance'], [878, 'Ficção Científica'], [53, 'Thriller']
      ];

      for (const [id, name] of initialGenres) {
        await pool.query('INSERT IGNORE INTO genres (id, name) VALUES (?, ?)', [id, name]);
      }

      // Seed Initial Demo Movies (Curated TMDb real ids and data)
      const seedMovies = [
        {
          id: 157336,
          title: 'Interestelar',
          original_title: 'Interstellar',
          poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
          backdrop_path: '/xJHokMbljvjADYdit5fKSuV0Te.jpg',
          overview: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar quais planetas oferecem condições para a sobrevivência da espécie humana. Cooper é chamado para liderar o grupo.',
          release_date: '2014-11-05',
          runtime: 169,
          vote_average: 8.4,
          vote_count: 34500,
          genres: [878, 18, 12]
        },
        {
          id: 27205,
          title: 'A Origem',
          original_title: 'Inception',
          poster_path: '/oYuLEIVWz2OiuhyCY7cW2q33xev.jpg',
          backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
          overview: 'Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente durante o estado de sono. Impedido de retornar para sua família, ele recebe uma oportunidade de redenção.',
          release_date: '2010-07-15',
          runtime: 148,
          vote_average: 8.4,
          vote_count: 35000,
          genres: [878, 28, 12]
        },
        {
          id: 155,
          title: 'Batman: O Cavaleiro das Trevas',
          original_title: 'The Dark Knight',
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          backdrop_path: '/nMK2819TyqLnTFiCBD9oYGi2qOp.jpg',
          overview: 'Após dois anos desde o surgimento do Batman, o crime organizado em Gotham City foi encurralado por Batman, o Tenente James Gordon e o novo Promotor de Justiça Harvey Dent. Porém, um novo sádico criminoso chamado Coringa surge para instaurar o caos.',
          release_date: '2008-07-16',
          runtime: 152,
          vote_average: 8.5,
          vote_count: 32000,
          genres: [18, 28, 80, 53]
        },
        {
          id: 550,
          title: 'Clube da Luta',
          original_title: 'Fight Club',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          backdrop_path: '/hZkgoQY85KGWFToRHub4ee1wY3C.jpg',
          overview: 'Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabão chamado Tyler Durden e se vê morando em uma casa caindo aos pedaços. Para esquecer suas vidas tediosas, eles formam um clube secreto com regras rígidas.',
          release_date: '1999-10-15',
          runtime: 139,
          vote_average: 8.4,
          vote_count: 28000,
          genres: [18, 53]
        },
        {
          id: 680,
          title: 'Pulp Fiction: Tempo de Violência',
          original_title: 'Pulp Fiction',
          poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
          backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfNIk.jpg',
          overview: 'As vidas de dois assassinos da máfia, um boxeador, a esposa de um gângster e um par de assaltantes se entrelaçam em quatro histórias de violência e redenção.',
          release_date: '1994-09-10',
          runtime: 154,
          vote_average: 8.5,
          vote_count: 27000,
          genres: [53, 80]
        },
        {
          id: 238,
          title: 'O Padrinho',
          original_title: 'The Godfather',
          poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          backdrop_path: '/rSPw7tgCH9c6NqICZefy2aUMqC.jpg',
          overview: 'Em 1945, Don Vito Corleone é o chefe de uma família da máfia nova-iorquina. Quando um rival decide vender drogas em Nova Iorque, Don Vito recusa apoiar o negócio, desencadeando uma guerra sangrenta.',
          release_date: '1972-03-14',
          runtime: 175,
          vote_average: 8.7,
          vote_count: 19000,
          genres: [18, 80]
        }
      ];

      for (const m of seedMovies) {
        await pool.query(
          `INSERT IGNORE INTO movies (id, title, original_title, poster_path, backdrop_path, overview, release_date, runtime, vote_average, vote_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.id, m.title, m.original_title, m.poster_path, m.backdrop_path, m.overview, m.release_date, m.runtime, m.vote_average, m.vote_count]
        );

        for (const gId of m.genres) {
          await pool.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [m.id, gId]);
        }
      }

      // Seed Demo User Interactions (User Movies & Reviews)
      await pool.query(`
        INSERT INTO user_movies (user_id, movie_id, status, rating, review, contains_spoilers, is_favorite, watched_at) VALUES
        (1, 157336, 'JA_VI', 5.0, 'Uma obra-prima absoluta sobre amor, ciência e a imensidão do tempo. A trilha sonora de Hans Zimmer é inesquecível!', FALSE, TRUE, '2026-01-15'),
        (1, 27205, 'JA_VI', 4.5, 'Complexo, eletrizante e com uma direção de arte impecável. Christopher Nolan no seu auge.', FALSE, TRUE, '2026-02-01'),
        (2, 550, 'JA_VI', 5.0, 'A primeira regra do Clube da Luta é não falar sobre o Clube da Luta. Roteiro genial!', FALSE, TRUE, '2026-02-10'),
        (2, 157336, 'JA_VI', 5.0, 'Chorei na cena de coop assistindo os vídeos dos filhos. Filmaço!', FALSE, FALSE, '2026-02-14'),
        (3, 155, 'JA_VI', 5.0, 'Heath Ledger entregou a maior atuação de vilão da história do cinema.', FALSE, TRUE, '2026-02-20'),
        (1, 680, 'QUERO_VER', NULL, NULL, FALSE, FALSE, NULL)
      `);

      // Seed Followers
      await pool.query(`
        INSERT INTO user_followers (follower_id, following_id) VALUES
        (1, 2), (1, 3), (2, 1), (3, 1)
      `);

      // Seed Lists
      const [listResult] = await pool.query(`
        INSERT INTO lists (user_id, title, description, is_private) VALUES
        (1, 'Top Filmes de Ficção Científica Inesquecíveis', 'Uma seleção dos meus filmes de Sci-Fi favoritos de todos os tempos.', FALSE)
      `);
      const listId = listResult.insertId;

      await pool.query(`
        INSERT INTO list_movies (list_id, movie_id) VALUES (?, 157336), (?, 27205)
      `, [listId, listId]);

      console.log('✅ Dados de demonstração semeados com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro na inicialização do MySQL:', error);
  }
}

module.exports = initDb;
