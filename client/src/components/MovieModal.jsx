import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Star, Check, Bookmark, Heart, MessageSquare, ThumbsUp, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import StarRating from './StarRating';

export default function MovieModal({ movieId, onClose, user, onInteractionUpdated, showToast }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Interaction Form State
  const [status, setStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [review, setReview] = useState('');
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('filmow_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/movies/${movieId}`, { headers });
      
      setMovie(res.data);

      if (res.data.user_interaction) {
        const ui = res.data.user_interaction;
        setStatus(ui.status || null);
        setRating(ui.rating ? Number(ui.rating) : 0);
        setIsFavorite(!!ui.is_favorite);
        setReview(ui.review || '');
        setContainsSpoilers(!!ui.contains_spoilers);
      }
    } catch (err) {
      setError('Erro ao carregar detalhes do filme.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInteraction = async (newStatus = status, newRating = rating, newFav = isFavorite) => {
    if (!user) {
      if (showToast) showToast('Faça login para colocar estrelas, marcar ou avaliar filmes!', 'auth');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('filmow_token');
      await axios.post(
        `/api/movies/${movieId}/interact`,
        {
          status: newStatus || 'JA_VI',
          rating: newRating,
          review: review,
          contains_spoilers: containsSpoilers,
          is_favorite: newFav
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(newStatus || 'JA_VI');
      setRating(newRating);
      setIsFavorite(newFav);

      if (showToast) showToast('Sua avaliação foi salva no Filmow!', 'success');
      if (onInteractionUpdated) onInteractionUpdated();
      fetchMovieDetails(); // Refresh reviews and stats
    } catch (err) {
      if (showToast) showToast('Erro ao salvar sua avaliação.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      if (showToast) showToast('Faça login para curtir críticas.', 'auth');
      return;
    }
    try {
      const token = localStorage.getItem('filmow_token');
      await axios.post(
        '/api/social/like',
        { target_type: 'REVIEW', target_id: reviewId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMovieDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (!movieId) return null;

  const backdropUrl = movie?.backdrop_path
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`)
    : null;

  const posterUrl = movie?.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750/0f172a/94a3b8?text=Sem+Poster';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-modal shadow-2xl border border-slate-700/50 text-slate-100 my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-amber-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400"></div>
          </div>
        ) : movie ? (
          <div>
            {/* Header Banner Backdrop */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              {backdropUrl && (
                <img 
                  src={backdropUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover opacity-40 blur-xs scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

              {/* Title & Info Banner */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row gap-6 items-end sm:items-center">
                <img 
                  src={posterUrl} 
                  alt={movie.title} 
                  className="w-28 sm:w-36 rounded-xl shadow-2xl border-2 border-slate-700/60 flex-shrink-0"
                />

                <div className="flex-1">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {movie.title}
                  </h1>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="text-sm text-slate-400 italic mt-0.5">{movie.original_title}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-slate-300 font-medium">
                    {movie.release_date && (
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                        {movie.release_date.split('-')[0]}
                      </span>
                    )}
                    {movie.runtime && (
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                        {movie.runtime} min
                      </span>
                    )}
                    {movie.vote_average && (
                      <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/30 font-bold">
                        <Star className="w-4 h-4 fill-amber-400" />
                        TMDb: {Number(movie.vote_average).toFixed(1)}
                      </span>
                    )}
                    {movie.community_stats?.rating && (
                      <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-md border border-cyan-500/30 font-bold">
                        Filmow: {movie.community_stats.rating}★ ({movie.community_stats.total_ratings} avaliações)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* User Action Control Panel (Filmow Status & Rating Bar) */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleSaveInteraction('JA_VI', rating, isFavorite)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      status === 'JA_VI'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Já Vi
                  </button>

                  <button
                    onClick={() => handleSaveInteraction('QUERO_VER', rating, isFavorite)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      status === 'QUERO_VER'
                        ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" /> Quero Ver
                  </button>

                  <button
                    onClick={() => handleSaveInteraction('ABANDONEI', rating, isFavorite)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      status === 'ABANDONEI'
                        ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <X className="w-4 h-4" /> Abandonei
                  </button>

                  <button
                    onClick={() => handleSaveInteraction(status, rating, !isFavorite)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                      isFavorite
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                    }`}
                    title="Favoritar Filme"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-slate-950' : ''}`} />
                  </button>
                </div>

                {/* Rating Input */}
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-xs text-slate-400 mb-1 font-semibold">Sua Nota (0.5 a 5.0):</span>
                  <StarRating 
                    value={rating} 
                    onChange={(newR) => handleSaveInteraction(status || 'JA_VI', newR, isFavorite)} 
                    size="lg"
                  />
                </div>
              </div>

              {/* Genres & Overview */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres?.map(g => (
                    <span key={g.id} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                      {g.name}
                    </span>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Sinopse</h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {movie.overview || 'Nenhuma sinopse disponível para este filme.'}
                </p>
              </div>

              {/* Write Review Form */}
              {user && (
                <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" /> Escrever Crítica / Avaliação
                  </h3>

                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="O que você achou do filme? Conte aos seus amigos..."
                    className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                      <input 
                        type="checkbox"
                        checked={containsSpoilers}
                        onChange={(e) => setContainsSpoilers(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Esta avaliação contém spoilers!
                    </label>

                    <button
                      onClick={() => handleSaveInteraction()}
                      disabled={submitting}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Salvando...' : 'Publicar Crítica'}
                    </button>
                  </div>
                </div>
              )}

              {/* Community Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Críticas da Comunidade</span>
                  <span className="text-xs text-slate-400 font-normal">({movie.reviews?.length || 0} resenhas)</span>
                </h3>

                {movie.reviews?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhuma crítica publicada ainda. Seja o primeiro a opinar!</p>
                ) : (
                  <div className="space-y-4">
                    {movie.reviews?.map((r) => {
                      const isSpoilerHidden = r.contains_spoilers && !revealedSpoilers[r.id];

                      return (
                        <div key={r.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={r.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.username}`} 
                                alt={r.user_name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-700"
                              />
                              <div>
                                <h4 className="text-sm font-semibold text-slate-200">{r.user_name}</h4>
                                <span className="text-xs text-slate-500">@{r.username}</span>
                              </div>
                            </div>

                            {r.rating && (
                              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold text-amber-400 border border-amber-500/20">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {Number(r.rating).toFixed(1)}
                              </div>
                            )}
                          </div>

                          {/* Spoiler Warning or Review Text */}
                          {isSpoilerHidden ? (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 flex items-center justify-between">
                              <span className="flex items-center gap-2 font-medium">
                                <AlertTriangle className="w-4 h-4 text-amber-400" /> Esta avaliação contém spoilers!
                              </span>
                              <button 
                                onClick={() => setRevealedSpoilers(prev => ({ ...prev, [r.id]: true }))}
                                className="text-xs underline font-bold hover:text-white"
                              >
                                Revelar Texto
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                              {r.review}
                            </p>
                          )}

                          {/* Review Action Footer */}
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                            <span>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                            <button
                              onClick={() => handleLikeReview(r.id)}
                              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{r.likes_count || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Filme não encontrado.</div>
        )}

      </div>
    </div>
  );
}
