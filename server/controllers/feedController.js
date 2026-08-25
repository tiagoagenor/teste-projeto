const UserMovie = require('../models/UserMovie');
const Movie = require('../models/Movie');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

exports.getFeed = async (req, res) => {
  try {
    const userMovieDocs = await UserMovie.find()
      .populate('user_id', 'name username avatar_url')
      .sort({ updated_at: -1 })
      .limit(20);

    const activities = await Promise.all(
      userMovieDocs.map(async (um) => {
        const movie = await Movie.findById(um.movie_id);
        const likesCount = await Like.countDocuments({ target_type: 'REVIEW', target_id: um._id });
        const commentsCount = await Comment.countDocuments({ target_type: 'REVIEW', target_id: um._id });

        let isLiked = false;
        if (req.user) {
          const userLike = await Like.findOne({
            user_id: req.user.id,
            target_type: 'REVIEW',
            target_id: um._id
          });
          isLiked = Boolean(userLike);
        }

        return {
          activity_id: um._id,
          status: um.status,
          rating: um.rating,
          review: um.review,
          contains_spoilers: um.contains_spoilers,
          is_favorite: um.is_favorite,
          timestamp: um.updated_at,
          user_id: um.user_id ? um.user_id._id : null,
          user_name: um.user_id ? um.user_id.name : 'Anônimo',
          username: um.user_id ? um.user_id.username : '',
          avatar_url: um.user_id ? um.user_id.avatar_url : '',
          movie_id: um.movie_id,
          movie_title: movie ? movie.title : 'Filme',
          movie_poster: movie ? movie.poster_path : null,
          movie_year: movie ? movie.release_date : '',
          likes_count: likesCount,
          comments_count: commentsCount,
          is_liked: isLiked
        };
      })
    );

    return res.json(activities);
  } catch (err) {
    console.error('Erro ao buscar feed:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar timeline.' });
  }
};
