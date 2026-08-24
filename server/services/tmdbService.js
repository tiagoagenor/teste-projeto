const axios = require('axios');
const pool = require('../config/db');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Mock fallback catalog for when no TMDB API KEY is provided
const fallbackMovies = [
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
    genres: [{ id: 878, name: 'Ficção Científica' }, { id: 18, name: 'Drama' }, { id: 12, name: 'Aventura' }]
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
    genres: [{ id: 878, name: 'Ficção Científica' }, { id: 28, name: 'Ação' }, { id: 12, name: 'Aventura' }]
  },
  {
    id: 155,
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
    id: 550,
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
    genres: [{ id: 53, name: 'Thriller' }, { id: 80, name: 'Crime' }]
  },
  {
    id: 238,
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
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    original_title: 'Oppenheimer',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    overview: 'A história do físico americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e o desenvolvimento da bomba atômica durante a Segunda Guerra Mundial.',
    release_date: '2023-07-19',
    runtime: 180,
    vote_average: 8.1,
    vote_count: 8900,
    genres: [{ id: 18, name: 'Drama' }, { id: 36, name: 'História' }]
  },
  {
    id: 438631,
    title: 'Duna: Parte Dois',
    original_title: 'Dune: Part Two',
    poster_path: '/8b8R8W88vje9dn9OE8PY05Nxl1X.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s52B3xs.jpg',
    overview: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo.',
    release_date: '2024-02-27',
    runtime: 166,
    vote_average: 8.2,
    vote_count: 5400,
    genres: [{ id: 878, name: 'Ficção Científica' }, { id: 12, name: 'Aventura' }]
  }
];

class TmdbService {
  async getPopularMovies() {
    if (!TMDB_API_KEY) {
      return fallbackMovies;
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR', page: 1 }
      });
      const movies = response.data.results;
      await this.cacheMovies(movies);
      return movies;
    } catch (err) {
      console.warn('⚠️ Falha ao buscar no TMDb, usando catálogo em cache:', err.message);
      return fallbackMovies;
    }
  }

  async getTopRatedMovies() {
    if (!TMDB_API_KEY) {
      return [...fallbackMovies].sort((a, b) => b.vote_average - a.vote_average);
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR', page: 1 }
      });
      const movies = response.data.results;
      await this.cacheMovies(movies);
      return movies;
    } catch (err) {
      return [...fallbackMovies].sort((a, b) => b.vote_average - a.vote_average);
    }
  }

  async getUpcomingMovies() {
    if (!TMDB_API_KEY) {
      return fallbackMovies.slice(4);
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR', page: 1 }
      });
      return response.data.results;
    } catch (err) {
      return fallbackMovies.slice(4);
    }
  }

  async searchMovies(query) {
    if (!query) return [];

    if (!TMDB_API_KEY) {
      const q = query.toLowerCase();
      return fallbackMovies.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.original_title.toLowerCase().includes(q)
      );
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: { api_key: TMDB_API_KEY, language: 'pt-BR', query, page: 1 }
      });
      const movies = response.data.results;
      await this.cacheMovies(movies);
      return movies;
    } catch (err) {
      const q = query.toLowerCase();
      return fallbackMovies.filter(m => m.title.toLowerCase().includes(q));
    }
  }

  async getMovieDetails(movieId) {
    // First check local DB
    const [rows] = await pool.query('SELECT * FROM movies WHERE id = ?', [movieId]);
    
    if (rows.length > 0) {
      const movie = rows[0];
      // Get genres
      const [genreRows] = await pool.query(`
        SELECT g.id, g.name FROM genres g
        JOIN movie_genres mg ON mg.genre_id = g.id
        WHERE mg.movie_id = ?
      `, [movieId]);
      movie.genres = genreRows;
      return movie;
    }

    // Try TMDb if API KEY exists
    if (TMDB_API_KEY) {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
          params: { api_key: TMDB_API_KEY, language: 'pt-BR' }
        });
        const m = response.data;
        await this.cacheMovieDetails(m);
        return m;
      } catch (err) {
        console.error('Erro ao buscar detalhes no TMDb:', err.message);
      }
    }

    // Fallback search in static list
    const found = fallbackMovies.find(m => m.id === Number(movieId));
    if (found) return found;

    return null;
  }

  async cacheMovies(movies) {
    for (const m of movies) {
      await pool.query(`
        INSERT INTO movies (id, title, original_title, poster_path, backdrop_path, overview, release_date, vote_average, vote_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          poster_path = VALUES(poster_path),
          vote_average = VALUES(vote_average)
      `, [m.id, m.title, m.original_title || m.title, m.poster_path, m.backdrop_path, m.overview, m.release_date, m.vote_average, m.vote_count]);
    }
  }

  async cacheMovieDetails(m) {
    await pool.query(`
      INSERT INTO movies (id, title, original_title, poster_path, backdrop_path, overview, release_date, runtime, vote_average, vote_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        overview = VALUES(overview),
        runtime = VALUES(runtime),
        vote_average = VALUES(vote_average)
    `, [m.id, m.title, m.original_title || m.title, m.poster_path, m.backdrop_path, m.overview, m.release_date, m.runtime || 120, m.vote_average, m.vote_count]);

    if (m.genres && m.genres.length > 0) {
      for (const g of m.genres) {
        await pool.query('INSERT IGNORE INTO genres (id, name) VALUES (?, ?)', [g.id, g.name]);
        await pool.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [m.id, g.id]);
      }
    }
  }
}

module.exports = new TmdbService();
