const pool = require('../config/db');

exports.getFeed = async (req, res) => {
  try {
    let query = `
      SELECT 
        um.id AS activity_id,
        um.status,
        um.rating,
        um.review,
        um.contains_spoilers,
        um.is_favorite,
        um.updated_at AS timestamp,
        u.id AS user_id,
        u.name AS user_name,
        u.username,
        u.avatar_url,
        m.id AS movie_id,
        m.title AS movie_title,
        m.poster_path AS movie_poster,
        m.release_date AS movie_year,
        (SELECT COUNT(*) FROM likes WHERE target_type = 'REVIEW' AND target_id = um.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE target_type = 'REVIEW' AND target_id = um.id) AS comments_count
    `;

    if (req.user) {
      query += `,
        (SELECT COUNT(*) FROM likes WHERE target_type = 'REVIEW' AND target_id = um.id AND user_id = ${pool.escape(req.user.id)}) > 0 AS is_liked
      `;
    } else {
      query += `, FALSE AS is_liked `;
    }

    query += `
      FROM user_movies um
      JOIN users u ON u.id = um.user_id
      JOIN movies m ON m.id = um.movie_id
      ORDER BY um.updated_at DESC
      LIMIT 20
    `;

    const [activities] = await pool.query(query);
    return res.json(activities);
  } catch (err) {
    console.error('Erro ao buscar feed:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar timeline.' });
  }
};
