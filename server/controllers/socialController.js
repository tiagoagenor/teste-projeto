const Like = require('../models/Like');
const Comment = require('../models/Comment');

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { target_type, target_id } = req.body; // target_type: 'REVIEW', 'LIST', 'COMMENT'

    if (!target_type || !target_id) {
      return res.status(400).json({ error: 'target_type e target_id são obrigatórios.' });
    }

    const existing = await Like.findOne({
      user_id: userId,
      target_type,
      target_id
    });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      return res.json({ liked: false, message: 'Curtida removida.' });
    } else {
      await Like.create({
        user_id: userId,
        target_type,
        target_id
      });
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

    const newComment = await Comment.create({
      user_id: userId,
      target_type: target_type || 'REVIEW',
      target_id,
      content: content.trim()
    });

    return res.status(201).json({ message: 'Comentário publicado!', commentId: newComment._id });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao publicar comentário.' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { target_type, target_id } = req.query;

    const commentDocs = await Comment.find({
      target_type: target_type || 'REVIEW',
      target_id
    })
      .populate('user_id', 'name username avatar_url')
      .sort({ created_at: 1 });

    const comments = commentDocs.map((c) => ({
      id: c._id,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id ? c.user_id._id : null,
      user_name: c.user_id ? c.user_id.name : 'Anônimo',
      username: c.user_id ? c.user_id.username : '',
      avatar_url: c.user_id ? c.user_id.avatar_url : ''
    }));

    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar comentários.' });
  }
};
