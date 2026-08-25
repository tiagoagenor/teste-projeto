const tmdbService = require('../services/tmdbService');
const UserMovie = require('../models/UserMovie');
const Like = require('../models/Like');

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
    const movieId = Number(req.params.id);
    const movie = await tmdbService.getMovieDetails(movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }

    // Community Stats
    const userMovies = await UserMovie.find({ movie_id: movieId });

    let totalRatingsCount = 0;
    let totalRatingsSum = 0;
    let watchedCount = 0;
    let wantCount = 0;
    let favoriteCount = 0;

    userMovies.forEach((um) => {
      if (um.rating !== null && um.rating !== undefined) {
        totalRatingsCount++;
        totalRatingsSum += um.rating;
      }
      if (um.status === 'JA_VI') watchedCount++;
      if (um.status === 'QUERO_VER') wantCount++;
      if (um.is_favorite) favoriteCount++;
    });

    const avgRating = totalRatingsCount > 0 ? (totalRatingsSum / totalRatingsCount).toFixed(1) : null;

    // Community Reviews for this movie
    const reviewDocs = await UserMovie.find({
      movie_id: movieId,
      review: { $exists: true, $ne: null, $regex: /\S/ }
    })
      .populate('user_id', 'name username avatar_url')
      .sort({ created_at: -1 })
      .limit(10);

    const reviews = await Promise.all(
      reviewDocs.map(async (doc) => {
        const likesCount = await Like.countDocuments({ target_type: 'REVIEW', target_id: doc._id });
        return {
          id: doc._id,
          rating: doc.rating,
          review: doc.review,
          contains_spoilers: doc.contains_spoilers,
          is_favorite: doc.is_favorite,
          created_at: doc.created_at,
          user_id: doc.user_id ? doc.user_id._id : null,
          user_name: doc.user_id ? doc.user_id.name : 'Anônimo',
          username: doc.user_id ? doc.user_id.username : '',
          avatar_url: doc.user_id ? doc.user_id.avatar_url : '',
          likes_count: likesCount
        };
      })
    );

    // User's interaction if logged in
    let userInteraction = null;
    if (req.user) {
      const um = await UserMovie.findOne({ user_id: req.user.id, movie_id: movieId });
      if (um) {
        userInteraction = {
          status: um.status,
          rating: um.rating,
          review: um.review,
          contains_spoilers: um.contains_spoilers,
          is_favorite: um.is_favorite,
          watched_at: um.watched_at
        };
      }
    }

    return res.json({
      ...movie,
      community_stats: {
        rating: avgRating,
        total_ratings: totalRatingsCount,
        watched_count: watchedCount,
        want_count: wantCount,
        favorite_count: favoriteCount
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

    // Cache movie first
    await tmdbService.getMovieDetails(movieId);

    const watchedAt = status === 'JA_VI' ? new Date() : null;

    await UserMovie.findOneAndUpdate(
      { user_id: userId, movie_id: movieId },
      {
        user_id: userId,
        movie_id: movieId,
        status: status || 'JA_VI',
        rating: rating !== undefined && rating !== null && rating !== '' ? Number(rating) : null,
        review: review || null,
        contains_spoilers: Boolean(contains_spoilers),
        is_favorite: Boolean(is_favorite),
        watched_at: watchedAt
      },
      { upsert: true, new: true }
    );

    return res.json({ message: 'Interação registrada com sucesso!' });
  } catch (err) {
    console.error('Erro na interação com filme:', err);
    return res.status(500).json({ error: 'Erro ao salvar avaliação do filme.' });
  }
};

exports.removeInteraction = async (req, res) => {
  try {
    const movieId = Number(req.params.id);
    const userId = req.user.id;

    await UserMovie.deleteOne({ user_id: userId, movie_id: movieId });
    return res.json({ message: 'Marcação removida.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover interação.' });
  }
};
