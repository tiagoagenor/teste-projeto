const pool = require('../config/db');

exports.getLists = async (req, res) => {
  try {
    const [lists] = await pool.query(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.username,
        u.avatar_url,
        COUNT(lm.movie_id) AS movie_count,
        (SELECT COUNT(*) FROM likes WHERE target_type = 'LIST' AND target_id = l.id) AS likes_count
      FROM lists l
      JOIN users u ON u.id = l.user_id
      LEFT JOIN list_movies lm ON lm.list_id = l.id
      WHERE l.is_private = FALSE
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT 20
    `);

    // For each list, fetch first 4 movie posters for preview grid
    for (const list of lists) {
      const [posters] = await pool.query(`
        SELECT m.poster_path, m.title 
        FROM list_movies lm
        JOIN movies m ON m.id = lm.movie_id
        WHERE lm.list_id = ?
        LIMIT 4
      `, [list.id]);
      list.posters = posters;
    }

    return res.json(lists);
  } catch (err) {
    console.error('Erro ao listar listas:', err);
    return res.status(500).json({ error: 'Erro ao buscar listas.' });
  }
};

exports.createList = async (req, res) => {
  try {
    const { title, description, is_private, movie_ids } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Título da lista é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO lists (user_id, title, description, is_private) VALUES (?, ?, ?, ?)',
      [userId, title, description || null, is_private ? true : false]
    );

    const listId = result.insertId;

    if (movie_ids && Array.isArray(movie_ids)) {
      for (const movieId of movie_ids) {
        await pool.query('INSERT IGNORE INTO list_movies (list_id, movie_id) VALUES (?, ?)', [listId, movieId]);
      }
    }

    return res.status(201).json({ message: 'Lista criada com sucesso!', listId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar lista.' });
  }
};

exports.getListDetails = async (req, res) => {
  try {
    const listId = req.params.id;

    const [lists] = await pool.query(`
      SELECT l.*, u.name AS user_name, u.username, u.avatar_url
      FROM lists l
      JOIN users u ON u.id = l.user_id
      WHERE l.id = ?
    `, [listId]);

    if (lists.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada.' });
    }

    const list = lists[0];

    const [movies] = await pool.query(`
      SELECT m.*, lm.added_at
      FROM list_movies lm
      JOIN movies m ON m.id = lm.movie_id
      WHERE lm.list_id = ?
      ORDER BY lm.added_at ASC
    `, [listId]);

    list.movies = movies;
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar detalhes da lista.' });
  }
};

exports.addMovieToList = async (req, res) => {
  try {
    const listId = req.params.id;
    const { movie_id } = req.body;
    const userId = req.user.id;

    const [check] = await pool.query('SELECT user_id FROM lists WHERE id = ?', [listId]);
    if (check.length === 0 || check[0].user_id !== userId) {
      return res.status(403).json({ error: 'Permissão negada.' });
    }

    await pool.query('INSERT IGNORE INTO list_movies (list_id, movie_id) VALUES (?, ?)', [listId, movie_id]);
    return res.json({ message: 'Filme adicionado à lista.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar filme à lista.' });
  }
};
