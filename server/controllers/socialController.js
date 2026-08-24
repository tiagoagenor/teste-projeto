const pool = require('../config/db');

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { target_type, target_id } = req.body; // target_type: 'REVIEW', 'LIST', 'COMMENT'

    if (!target_type || !target_id) {
      return res.status(400).json({ error: 'target_type e target_id são obrigatórios.' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, target_type, target_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM likes WHERE id = ?', [existing[0].id]);
      return res.json({ liked: false, message: 'Curtida removida.' });
    } else {
      await pool.query(
        'INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)',
        [userId, target_type, target_id]
      );
      return res.json({ liked: true, message: 'Curtido com sucesso!' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alternar curtida.' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { target_type, target_id, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo do comentário não pode ser vazio.' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (user_id, target_type, target_id, content) VALUES (?, ?, ?, ?)',
      [userId, target_type || 'REVIEW', target_id, content.trim()]
    );

    return res.status(201).json({ message: 'Comentário publicado!', commentId: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao publicar comentário.' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { target_type, target_id } = req.query;

    const [comments] = await pool.query(`
      SELECT c.*, u.name AS user_name, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.target_type = ? AND c.target_id = ?
      ORDER BY c.created_at ASC
    `, [target_type || 'REVIEW', target_id]);

    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar comentários.' });
  }
};
