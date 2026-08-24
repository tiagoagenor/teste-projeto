import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ThumbsUp, MessageSquare, AlertTriangle, Eye, Check } from 'lucide-react';

export default function FeedSection({ user, onSelectMovie, onViewProfile, showToast }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('filmow_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/feed', { headers });
      setActivities(res.data);
    } catch (err) {
      console.error('Erro ao buscar feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (activityId) => {
    if (!user) {
      if (showToast) showToast('Faça login para curtir avaliações!', 'auth');
      return;
    }
    try {
      const token = localStorage.getItem('filmow_token');
      await axios.post(
        '/api/social/like',
        { target_type: 'REVIEW', target_id: activityId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-amber-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Timeline da Comunidade</h2>
          <p className="text-xs text-slate-400 mt-1">Veja o que seus amigos e a comunidade estão assistindo e avaliando.</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          Nenhuma atividade no feed no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const posterUrl = act.movie_poster
              ? (act.movie_poster.startsWith('http') ? act.movie_poster : `https://image.tmdb.org/t/p/w200${act.movie_poster}`)
              : 'https://via.placeholder.com/200x300';

            return (
              <div 
                key={act.activity_id}
                className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => onViewProfile(act.username)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img 
                      src={act.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${act.username}`}
                      alt={act.user_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-amber-500 transition-colors"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {act.user_name}
                      </h4>
                      <span className="text-xs text-slate-500">@{act.username}</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500">
                    {new Date(act.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Movie & Rating Box */}
                <div className="flex gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 items-center">
                  <img 
                    src={posterUrl} 
                    alt={act.movie_title}
                    onClick={() => onSelectMovie({ id: act.movie_id, title: act.movie_title })}
                    className="w-14 h-20 object-cover rounded-lg cursor-pointer shadow hover:opacity-90 transition-opacity"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Assistiu
                      </span>

                      {act.rating && (
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-xs font-bold text-amber-400 border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {Number(act.rating).toFixed(1)}
                        </div>
                      )}
                    </div>

                    <h3 
                      onClick={() => onSelectMovie({ id: act.movie_id, title: act.movie_title })}
                      className="text-base font-bold text-white mt-1 cursor-pointer hover:text-amber-400 transition-colors truncate"
                    >
                      {act.movie_title}
                    </h3>
                  </div>
                </div>

                {/* Review Text */}
                {act.review && (
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/40 italic">
                    "{act.review}"
                  </p>
                )}

                {/* Footer Interactions */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleLike(act.activity_id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      act.is_liked
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{act.likes_count || 0} Curtidas</span>
                  </button>

                  <button 
                    onClick={() => onSelectMovie({ id: act.movie_id, title: act.movie_title })}
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ver Discussão</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
