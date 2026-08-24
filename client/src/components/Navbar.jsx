import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Film, Search, Users, List, User, LogOut, LogIn, Star, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout, onSelectMovie, onViewProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              Filmow<span className="text-amber-400">Clone</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
              Rede Social de Filmes
            </span>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              placeholder="Buscar filmes pelo título..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">Buscando filmes...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">Nenhum filme encontrado.</div>
              ) : (
                searchResults.map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      onSelectMovie(movie);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-slate-800/40 last:border-0"
                  >
                    <img 
                      src={movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}`) : 'https://via.placeholder.com/92x138'}
                      alt={movie.title}
                      className="w-9 h-13 object-cover rounded bg-slate-950"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 truncate">{movie.title}</h4>
                      <p className="text-[11px] text-slate-400">{movie.release_date ? movie.release_date.split('-')[0] : ''}</p>
                    </div>
                    {movie.vote_average && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-400" /> {Number(movie.vote_average).toFixed(1)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'explore' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> <span className="hidden md:inline">Explorar</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'feed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> <span className="hidden md:inline">Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'lists' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" /> <span className="hidden md:inline">Listas</span>
          </button>

          {/* Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => onViewProfile(user.username)}
                className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-colors"
                title="Meu Perfil"
              >
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="hidden lg:inline text-xs font-semibold text-slate-200 pr-1">{user.username}</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all ml-2"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          )}
        </nav>

      </div>
    </header>
  );
}
