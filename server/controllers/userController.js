const User = require('../models/User');
const UserMovie = require('../models/UserMovie');
const Movie = require('../models/Movie');
const Follower = require('../models/Follower');

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() }).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'Perfil de usuário não encontrado.' });
    }

    // User Movie Stats
    const userMovies = await UserMovie.find({ user_id: user._id }).populate('movie_id');

    let totalWatched = 0;
    let totalWant = 0;
    let totalFavorites = 0;
    let totalReviews = 0;
    let totalMinutes = 0;
    const ratingMap = {};

    userMovies.forEach((um) => {
      if (um.status === 'JA_VI') {
        totalWatched++;
        const movieRuntime = um.movie_id && um.movie_id.runtime ? um.movie_id.runtime : 120;
        totalMinutes += movieRuntime;
      }
      if (um.status === 'QUERO_VER') totalWant++;
      if (um.is_favorite) totalFavorites++;
      if (um.review && um.review.trim().length > 0) totalReviews++;
      if (um.rating !== null && um.rating !== undefined) {
        ratingMap[um.rating] = (ratingMap[um.rating] || 0) + 1;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);

    const ratingDistribution = Object.keys(ratingMap)
      .sort((a, b) => Number(a) - Number(b))
      .map((r) => ({ rating: Number(r), count: ratingMap[r] }));

    // Favorites (Top 4)
    const favoriteDocs = await UserMovie.find({ user_id: user._id, is_favorite: true })
      .sort({ updated_at: -1 })
      .limit(4);

    const favorites = await Promise.all(
      favoriteDocs.map(async (doc) => {
        const m = await Movie.findById(doc.movie_id);
        return {
          id: doc.movie_id,
          title: m ? m.title : 'Filme',
          poster_path: m ? m.poster_path : null,
          release_date: m ? m.release_date : null,
          vote_average: m ? m.vote_average : 0,
          rating: doc.rating
        };
      })
    );

    // Followers & Following Count
    const followersCount = await Follower.countDocuments({ following_id: user._id });
    const followingCount = await Follower.countDocuments({ follower_id: user._id });

    // Is current user following this profile?
    let isFollowing = false;
    if (req.user && String(req.user.id) !== String(user._id)) {
      const followCheck = await Follower.findOne({
        follower_id: req.user.id,
        following_id: user._id
      });
      isFollowing = Boolean(followCheck);
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at
      },
      stats: {
        total_watched: totalWatched,
        total_want: totalWant,
        total_favorites: totalFavorites,
        total_reviews: totalReviews,
        total_hours: totalHours,
        rating_distribution: ratingDistribution
      },
      social: {
        followers_count: followersCount,
        following_count: followingCount,
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

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const query = { user_id: user._id };

    if (status === 'FAVORITOS') {
      query.is_favorite = true;
    } else if (status === 'REVIEWS') {
      query.review = { $exists: true, $ne: null, $regex: /\S/ };
    } else if (status) {
      query.status = status;
    }

    const userMovies = await UserMovie.find(query).sort({ updated_at: -1 });

    const moviesList = await Promise.all(
      userMovies.map(async (um) => {
        const m = await Movie.findById(um.movie_id);
        return {
          id: um._id,
          user_id: um.user_id,
          movie_id: um.movie_id,
          status: um.status,
          rating: um.rating,
          review: um.review,
          contains_spoilers: um.contains_spoilers,
          is_favorite: um.is_favorite,
          watched_at: um.watched_at,
          created_at: um.created_at,
          updated_at: um.updated_at,
          title: m ? m.title : 'Filme',
          original_title: m ? m.original_title : '',
          poster_path: m ? m.poster_path : null,
          backdrop_path: m ? m.backdrop_path : null,
          release_date: m ? m.release_date : '',
          vote_average: m ? m.vote_average : 0
        };
      })
    );

    return res.json(moviesList);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar filmes do usuário.' });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ error: 'Você não pode seguir a si mesmo.' });
    }

    const existing = await Follower.findOne({
      follower_id: currentUserId,
      following_id: targetUserId
    });

    if (existing) {
      await Follower.deleteOne({ _id: existing._id });
      return res.json({ following: false, message: 'Deixou de seguir o usuário.' });
    } else {
      await Follower.create({
        follower_id: currentUserId,
        following_id: targetUserId
      });
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

    await User.findByIdAndUpdate(userId, { name, bio, avatar_url });

    return res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};
