const tmdbService = require('../services/tmdbService');
const pool = require('../config/db');

exports.getPopular = async (req, res) => {
  try {
    const movies = await tmdbService.getPopularMovies();
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar filmes populares.' });
  }
};

exports.getTopRated = async (req, res) => {
  try {
    const movies = await tmdbService.getTopRatedMovies();
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar filmes mais bem avaliados.' });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const movies = await tmdbService.getUpcomingMovies();
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar filmes em breve.' });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const movies = await tmdbService.searchMovies(q);
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao pesquisar filmes.' });
  }
};

exports.getMovieDetails = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await tmdbService.getMovieDetails(movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }

    // Get Community stats for this movie (Average User Rating & Rating Counts)
    const [stats] = await pool.query(`
      SELECT 
        AVG(rating) AS community_rating,
        COUNT(rating) AS total_ratings,
        SUM(CASE WHEN status = 'JA_VI' THEN 1 ELSE 0 END) AS watched_count,
        SUM(CASE WHEN status = 'QUERO_VER' THEN 1 ELSE 0 END) AS want_count,
        SUM(CASE WHEN is_favorite = TRUE THEN 1 ELSE 0 END) AS favorite_count
      FROM user_movies
      WHERE movie_id = ?
    `, [movieId]);

    // Get Recent Community Reviews for this movie
    const [reviews] = await pool.query(`
      SELECT 
        um.id,
        um.rating,
        um.review,
        um.contains_spoilers,
        um.is_favorite,
        um.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.username,
        u.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE target_type = 'REVIEW' AND target_id = um.id) AS likes_count
      FROM user_movies um
      JOIN users u ON u.id = um.user_id
      WHERE um.movie_id = ? AND um.review IS NOT NULL AND CHAR_LENGTH(TRIM(um.review)) > 0
      ORDER BY um.created_at DESC
      LIMIT 10
    `, [movieId]);

    // Check current user's interaction if authenticated
    let userInteraction = null;
    if (req.user) {
      const [userRows] = await pool.query(`
        SELECT status, rating, review, contains_spoilers, is_favorite, watched_at
        FROM user_movies
        WHERE user_id = ? AND movie_id = ?
      `, [req.user.id, movieId]);
      if (userRows.length > 0) {
        userInteraction = userRows[0];
      }
    }

    return res.json({
      ...movie,
      community_stats: {
        rating: stats[0].community_rating ? Number(stats[0].community_rating).toFixed(1) : null,
        total_ratings: stats[0].total_ratings || 0,
        watched_count: stats[0].watched_count || 0,
        want_count: stats[0].want_count || 0,
        favorite_count: stats[0].favorite_count || 0
      },
      reviews,
      user_interaction: userInteraction
    });
  } catch (err) {
    console.error('Erro nos detalhes do filme:', err);
    return res.status(500).json({ error: 'Erro ao buscar detalhes do filme.' });
  }
};

exports.interactWithMovie = async (req, res) => {
  try {
    const movieId = Number(req.params.id);
    const userId = req.user.id;
    const { status, rating, review, contains_spoilers, is_favorite } = req.body;

    // Ensure movie exists in MySQL cache first
    await tmdbService.getMovieDetails(movieId);

    const watchedAt = status === 'JA_VI' ? new Date() : null;

    // UPSERT into user_movies
    await pool.query(`
      INSERT INTO user_movies (user_id, movie_id, status, rating, review, contains_spoilers, is_favorite, watched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        rating = VALUES(rating),
        review = VALUES(review),
        contains_spoilers = VALUES(contains_spoilers),
        is_favorite = VALUES(is_favorite),
        watched_at = COALESCE(VALUES(watched_at), watched_at),
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      movieId,
      status || 'JA_VI',
      rating !== undefined && rating !== null && rating !== '' ? Number(rating) : null,
      review || null,
      contains_spoilers ? true : false,
      is_favorite ? true : false,
      watchedAt
    ]);

    return res.json({ message: 'Interação registrada com sucesso!' });
  } catch (err) {
    console.error('Erro na interação com filme:', err);
    return res.status(500).json({ error: 'Erro ao salvar avaliação do filme.' });
  }
};

exports.removeInteraction = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user.id;

    await pool.query('DELETE FROM user_movies WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
    return res.json({ message: 'Marcação removida.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover interação.' });
  }
};
