const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const [users] = await pool.query(
      'SELECT id, name, username, email, avatar_url, bio, created_at FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    }

    const user = users[0];

    // Stats: Total Watched, Want to Watch, Favorites, Estimated Hours
    const [stats] = await pool.query(`
      SELECT
        COUNT(CASE WHEN status = 'JA_VI' THEN 1 END) AS total_watched,
        COUNT(CASE WHEN status = 'QUERO_VER' THEN 1 END) AS total_want,
        COUNT(CASE WHEN is_favorite = TRUE THEN 1 END) AS total_favorites,
        COUNT(CASE WHEN review IS NOT NULL AND CHAR_LENGTH(TRIM(review)) > 0 THEN 1 END) AS total_reviews,
        COALESCE(SUM(CASE WHEN status = 'JA_VI' THEN m.runtime ELSE 0 END), 0) AS total_minutes
      FROM user_movies um
      JOIN movies m ON m.id = um.movie_id
      WHERE um.user_id = ?
    `, [user.id]);

    const totalMinutes = stats[0].total_minutes || 0;
    const totalHours = Math.round(totalMinutes / 60);

    // Rating Distribution (0.5 to 5.0)
    const [ratingDist] = await pool.query(`
      SELECT rating, COUNT(*) AS count
      FROM user_movies
      WHERE user_id = ? AND rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating ASC
    `, [user.id]);

    // Top 4 Favorite Movies
    const [favorites] = await pool.query(`
      SELECT m.id, m.title, m.poster_path, m.release_date, m.vote_average, um.rating
      FROM user_movies um
      JOIN movies m ON m.id = um.movie_id
      WHERE um.user_id = ? AND um.is_favorite = TRUE
      ORDER BY um.updated_at DESC
      LIMIT 4
    `, [user.id]);

    // Followers & Following Count
    const [socialCounts] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM user_followers WHERE following_id = ?) AS followers_count,
        (SELECT COUNT(*) FROM user_followers WHERE follower_id = ?) AS following_count
    `, [user.id, user.id]);

    // Is current user following this profile?
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const [followCheck] = await pool.query(
        'SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = ?',
        [req.user.id, user.id]
      );
      isFollowing = followCheck.length > 0;
    }

    return res.json({
      user,
      stats: {
        total_watched: stats[0].total_watched || 0,
        total_want: stats[0].total_want || 0,
        total_favorites: stats[0].total_favorites || 0,
        total_reviews: stats[0].total_reviews || 0,
        total_hours: totalHours,
        rating_distribution: ratingDist
      },
      social: {
        followers_count: socialCounts[0].followers_count || 0,
        following_count: socialCounts[0].following_count || 0,
        is_following: isFollowing
      },
      favorites
    });
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    return res.status(500).json({ error: 'Erro interno ao carregar perfil de usuário.' });
  }
};

exports.getUserMovies = async (req, res) => {
  try {
    const { username } = req.params;
    const { status } = req.query; // 'JA_VI', 'QUERO_VER', 'FAVORITOS', 'REVIEWS'

    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const userId = users[0].id;

    let query = `
      SELECT um.*, m.title, m.original_title, m.poster_path, m.backdrop_path, m.release_date, m.vote_average
      FROM user_movies um
      JOIN movies m ON m.id = um.movie_id
      WHERE um.user_id = ?
    `;
    const params = [userId];

    if (status === 'FAVORITOS') {
      query += ' AND um.is_favorite = TRUE';
    } else if (status === 'REVIEWS') {
      query += ' AND um.review IS NOT NULL AND CHAR_LENGTH(TRIM(um.review)) > 0';
    } else if (status) {
      query += ' AND um.status = ?';
      params.push(status);
    }

    query += ' ORDER BY um.updated_at DESC';

    const [movies] = await pool.query(query, params);
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar filmes do usuário.' });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (Number(targetUserId) === Number(currentUserId)) {
      return res.status(400).json({ error: 'Você não pode seguir a si mesmo.' });
    }

    const [check] = await pool.query(
      'SELECT * FROM user_followers WHERE follower_id = ? AND following_id = ?',
      [currentUserId, targetUserId]
    );

    if (check.length > 0) {
      await pool.query(
        'DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?',
        [currentUserId, targetUserId]
      );
      return res.json({ following: false, message: 'Deixou de seguir o usuário.' });
    } else {
      await pool.query(
        'INSERT INTO user_followers (follower_id, following_id) VALUES (?, ?)',
        [currentUserId, targetUserId]
      );
      return res.json({ following: true, message: 'Agora você está seguindo este usuário.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao seguir/deixar de seguir.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, avatar_url } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?',
      [name, bio, avatar_url, userId]
    );

    return res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};
