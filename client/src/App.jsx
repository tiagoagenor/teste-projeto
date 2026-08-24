import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import AuthModal from './components/AuthModal';
import FeedSection from './components/FeedSection';
import ProfileView from './components/ProfileView';
import ListsSection from './components/ListsSection';
import Toast from './components/Toast';
import { Sparkles, TrendingUp, Calendar, Star, Film, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'feed', 'lists', 'profile'
  const [user, setUser] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [targetUsername, setTargetUsername] = useState(null);
  const [toast, setToast] = useState(null);

  // Movie Catalog States
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    checkCurrentUser();
    fetchCatalog();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('filmow_token');
    if (!token) return;
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('filmow_token');
      setUser(null);
    }
  };

  const fetchCatalog = async () => {
    setLoadingMovies(true);
    try {
      const [popRes, topRes, upRes] = await Promise.all([
        axios.get('/api/movies/popular'),
        axios.get('/api/movies/top-rated'),
        axios.get('/api/movies/upcoming')
      ]);
      setPopularMovies(popRes.data);
      setTopRatedMovies(topRes.data);
      setUpcomingMovies(upRes.data);
    } catch (err) {
      console.error('Erro ao buscar catálogo de filmes:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('filmow_token');
    setUser(null);
    showToast('Você encerrou sua sessão.', 'info');
    if (activeTab === 'profile') setActiveTab('explore');
  };

  const handleViewProfile = (username) => {
    setTargetUsername(username);
    setActiveTab('profile');
  };

  const heroMovie = popularMovies[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      
      {/* Toast Notification Alert */}
      <Toast 
        toast={toast}
        onClose={() => setToast(null)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSelectMovie={(m) => setSelectedMovieId(m.id)}
        onViewProfile={handleViewProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* EXPLORE TAB */}
        {activeTab === 'explore' && (
          <div className="space-y-12 pb-16">
            
            {/* Hero Featured Movie Banner */}
            {heroMovie && (
              <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800 shadow-2xl">
                <div className="relative h-[360px] sm:h-[440px] w-full overflow-hidden bg-slate-950">
                  <img 
                    src={heroMovie.backdrop_path ? (heroMovie.backdrop_path.startsWith('http') ? heroMovie.backdrop_path : `https://image.tmdb.org/t/p/w1280${heroMovie.backdrop_path}`) : 'https://via.placeholder.com/1280x720'}
                    alt={heroMovie.title}
                    className="w-full h-full object-cover opacity-30 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>

                  <div className="absolute bottom-8 left-8 right-8 max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Destaque da Semana
                    </span>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      {heroMovie.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {heroMovie.overview}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => setSelectedMovieId(heroMovie.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 cursor-pointer"
                      >
                        <Film className="w-4 h-4 fill-slate-950" /> Ver Detalhes e Avaliar
                      </button>

                      {heroMovie.vote_average && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-md">
                          <Star className="w-4 h-4 fill-amber-400" /> TMDb {Number(heroMovie.vote_average).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Movies Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> Filmes Populares
                </h2>
                <span className="text-xs text-slate-400 font-medium">Os mais assistidos da comunidade</span>
              </div>

              {loadingMovies ? (
                <div className="flex items-center justify-center py-12 text-amber-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {popularMovies.map(m => (
                    <MovieCard key={m.id} movie={m} onClick={(movie) => setSelectedMovieId(movie.id)} />
                  ))}
                </div>
              )}
            </section>

            {/* Top Rated Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Mais Bem Avaliados
                </h2>
                <span className="text-xs text-slate-400 font-medium">Obras-primas com notas mais altas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {topRatedMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => setSelectedMovieId(movie.id)} />
                ))}
              </div>
            </section>

            {/* Upcoming Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-400" /> Em Breve nos Cinemas
                </h2>
                <span className="text-xs text-slate-400 font-medium">Adicione à sua lista de "Quero Ver"</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {upcomingMovies.map(m => (
                  <MovieCard key={m.id} movie={m} onClick={(movie) => setSelectedMovieId(movie.id)} />
                ))}
              </div>
            </section>

          </div>
        )}

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <FeedSection 
            user={user}
            onSelectMovie={(m) => setSelectedMovieId(m.id)}
            onViewProfile={handleViewProfile}
            showToast={showToast}
          />
        )}

        {/* LISTS TAB */}
        {activeTab === 'lists' && (
          <ListsSection 
            user={user}
            onSelectMovie={(m) => setSelectedMovieId(m.id)}
            showToast={showToast}
          />
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <ProfileView 
            username={targetUsername || user?.username || 'cinefilo'}
            currentUser={user}
            onSelectMovie={(m) => setSelectedMovieId(m.id)}
            showToast={showToast}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">Filmow Clone 2026</span> — Desenvolvido com Node.js, Express, MySQL e Tailwind CSS.
          </div>
          <p className="text-[11px] text-slate-600">Dados de filmes providos pela TMDb API.</p>
        </div>
      </footer>

      {/* Movie Details Modal */}
      {selectedMovieId && (
        <MovieModal 
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          user={user}
          onInteractionUpdated={fetchCatalog}
          showToast={showToast}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          showToast(`Bem-vindo(a) de volta, ${loggedUser.name}!`, 'success');
        }}
      />

    </div>
  );
}
