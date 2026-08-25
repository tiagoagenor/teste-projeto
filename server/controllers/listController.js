const List = require('../models/List');
const Movie = require('../models/Movie');
const Like = require('../models/Like');

exports.getLists = async (req, res) => {
  try {
    const listDocs = await List.find({ is_private: false })
      .populate('user_id', 'name username avatar_url')
      .sort({ created_at: -1 })
      .limit(20);

    const lists = await Promise.all(
      listDocs.map(async (list) => {
        const likesCount = await Like.countDocuments({ target_type: 'LIST', target_id: list._id });
        const movieDocs = await Movie.find({ _id: { $in: list.movie_ids.slice(0, 4) } }).select('poster_path title');
        return {
          id: list._id,
          title: list.title,
          description: list.description,
          created_at: list.created_at,
          user_id: list.user_id ? list.user_id._id : null,
          user_name: list.user_id ? list.user_id.name : 'Anônimo',
          username: list.user_id ? list.user_id.username : '',
          avatar_url: list.user_id ? list.user_id.avatar_url : '',
          movie_count: list.movie_ids ? list.movie_ids.length : 0,
          likes_count: likesCount,
          posters: movieDocs
        };
      })
    );

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

    const newList = await List.create({
      user_id: userId,
      title,
      description: description || null,
      is_private: Boolean(is_private),
      movie_ids: Array.isArray(movie_ids) ? movie_ids.map(Number) : []
    });

    return res.status(201).json({ message: 'Lista criada com sucesso!', listId: newList._id });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar lista.' });
  }
};

exports.getListDetails = async (req, res) => {
  try {
    const listId = req.params.id;

    const list = await List.findById(listId).populate('user_id', 'name username avatar_url');

    if (!list) {
      return res.status(404).json({ error: 'Lista não encontrada.' });
    }

    const movies = await Movie.find({ _id: { $in: list.movie_ids } });

    return res.json({
      id: list._id,
      title: list.title,
      description: list.description,
      is_private: list.is_private,
      created_at: list.created_at,
      user_name: list.user_id ? list.user_id.name : 'Anônimo',
      username: list.user_id ? list.user_id.username : '',
      avatar_url: list.user_id ? list.user_id.avatar_url : '',
      movies
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar detalhes da lista.' });
  }
};

exports.addMovieToList = async (req, res) => {
  try {
    const listId = req.params.id;
    const { movie_id } = req.body;
    const userId = req.user.id;

    const list = await List.findById(listId);
    if (!list || String(list.user_id) !== String(userId)) {
      return res.status(403).json({ error: 'Permissão negada.' });
    }

    const numMovieId = Number(movie_id);
    if (!list.movie_ids.includes(numMovieId)) {
      list.movie_ids.push(numMovieId);
      await list.save();
    }

    return res.json({ message: 'Filme adicionado à lista.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar filme à lista.' });
  }
};
