const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true }, // TMDB movie ID
    title: { type: String, required: true },
    original_title: { type: String, default: '' },
    poster_path: { type: String, default: null },
    backdrop_path: { type: String, default: null },
    overview: { type: String, default: '' },
    release_date: { type: String, default: '' },
    runtime: { type: Number, default: 120 },
    vote_average: { type: Number, default: 0.0 },
    vote_count: { type: Number, default: 0 },
    genres: [genreSchema]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Virtual for id to mirror MySQL response format
movieSchema.virtual('id').get(function () {
  return this._id;
});

movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Movie', movieSchema);
