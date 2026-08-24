import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserPlus, Film, Clock, Heart, MessageSquare, Star, Award } from 'lucide-react';
import MovieCard from './MovieCard';

export default function ProfileView({ username, currentUser, onSelectMovie, showToast }) {
  const [profileData, setProfileData] = useState(null);
  const [userMovies, setUserMovies] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('JA_VI');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserMovies('JA_VI');
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('filmow_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/users/${username}`, { headers });
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMovies = async (status) => {
    try {
      const res = await axios.get(`/api/users/${username}/movies?status=${status}`);
      setUserMovies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubTabChange = (tab) => {
    setActiveSubTab(tab);
    fetchUserMovies(tab);
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      if (showToast) showToast('Faça login para seguir outros cinéfilos!', 'auth');
      return;
    }
    try {
      const token = localStorage.getItem('filmow_token');
      await axios.post(
        `/api/users/${profileData.user.id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
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

  if (!profileData) {
    return <div className="text-center py-16 text-slate-400">Usuário não encontrado.</div>;
  }

  const { user, stats, social, favorites } = profileData;
  const isOwnProfile = currentUser && currentUser.username === user.username;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Profile Card */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.name}</h1>
                <p className="text-sm text-slate-400">@{user.username}</p>
              </div>

              {!isOwnProfile && currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    social.is_following
                      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-400'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  {social.is_following ? (
                    <> <UserCheck className="w-4 h-4" /> Seguindo </>
                  ) : (
                    <> <UserPlus className="w-4 h-4" /> Seguir </>
                  )}
                </button>
              )}
            </div>

            <p className="text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {user.bio || 'Este usuário ainda não adicionou uma biografia.'}
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
              <span><strong>{social.followers_count}</strong> Seguidores</span>
              <span>•</span>
              <span><strong>{social.following_count}</strong> Seguindo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
          <Film className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <span className="text-2xl font-black text-white">{stats.total_watched}</span>
          <p className="text-xs text-slate-400 font-medium mt-1">Filmes Assistidos</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
          <Clock className="w-5 h-5 text-sky-400 mx-auto mb-2" />
          <span className="text-2xl font-black text-white">{stats.total_hours}h</span>
          <p className="text-xs text-slate-400 font-medium mt-1">Tempo Assistido</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
          <Heart className="w-5 h-5 text-rose-400 mx-auto mb-2" />
          <span className="text-2xl font-black text-white">{stats.total_favorites}</span>
          <p className="text-xs text-slate-400 font-medium mt-1">Favoritos</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
          <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <span className="text-2xl font-black text-white">{stats.total_reviews}</span>
          <p className="text-xs text-slate-400 font-medium mt-1">Críticas Escritas</p>
        </div>
      </div>

      {/* Rating Distribution Bar Chart */}
      {stats.rating_distribution && stats.rating_distribution.length > 0 && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Distribuição de Notas (0.5 a 5.0 ★)
          </h3>

          <div className="flex items-end gap-2 h-24 pt-4 px-2">
            {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((starVal) => {
              const item = stats.rating_distribution.find(r => Number(r.rating) === starVal);
              const count = item ? Number(item.count) : 0;
              const maxCount = Math.max(...stats.rating_distribution.map(r => Number(r.count)), 1);
              const heightPercent = Math.round((count / maxCount) * 100);

              return (
                <div key={starVal} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-slate-950 rounded-t h-full flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                      title={`${starVal}★ : ${count} filmes`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{starVal}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 4 Favorites Shelf */}
      {favorites && favorites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Filmes Favoritos em Destaque
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.map(m => (
              <MovieCard key={m.id} movie={m} onClick={onSelectMovie} />
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs (Assistidos, Quero Ver, Avaliações) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => handleSubTabChange('JA_VI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'JA_VI' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Já Vi ({stats.total_watched})
          </button>

          <button
            onClick={() => handleSubTabChange('QUERO_VER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'QUERO_VER' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quero Ver ({stats.total_want})
          </button>

          <button
            onClick={() => handleSubTabChange('FAVORITOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'FAVORITOS' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Favoritos ({stats.total_favorites})
          </button>

          <button
            onClick={() => handleSubTabChange('REVIEWS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'REVIEWS' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Críticas ({stats.total_reviews})
          </button>
        </div>

        {/* User Movies Grid */}
        {userMovies.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            Nenhum filme nesta categoria ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {userMovies.map(um => (
              <MovieCard key={um.id} movie={{ id: um.movie_id, title: um.title, poster_path: um.poster_path, release_date: um.release_date, vote_average: um.vote_average, user_status: um.status }} onClick={onSelectMovie} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
