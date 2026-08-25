const mongoose = require('mongoose');

const userMovieSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie_id: { type: Number, ref: 'Movie', required: true }, // TMDB movie ID
    status: {
      type: String,
      enum: ['JA_VI', 'QUERO_VER', 'VENDO', 'ABANDONEI'],
      default: 'JA_VI'
    },
    rating: { type: Number, default: null },
    review: { type: String, default: null },
    contains_spoilers: { type: Boolean, default: false },
    is_favorite: { type: Boolean, default: false },
    watched_at: { type: Date, default: null }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userMovieSchema.index({ user_id: 1, movie_id: 1 }, { unique: true });

module.exports = mongoose.model('UserMovie', userMovieSchema);
