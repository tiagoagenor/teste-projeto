const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    is_private: { type: Boolean, default: false },
    movie_ids: [{ type: Number, ref: 'Movie' }]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('List', listSchema);
