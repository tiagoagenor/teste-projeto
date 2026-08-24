import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Plus, Heart, Film, X } from 'lucide-react';

export default function ListsSection({ user, onSelectMovie, showToast }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lists');
      setLists(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    setCreating(true);

    try {
      const token = localStorage.getItem('filmow_token');
      await axios.post(
        '/api/lists',
        { title: newListTitle, description: newListDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewListTitle('');
      setNewListDesc('');
      setIsModalOpen(false);
      if (showToast) showToast('Lista criada com sucesso!', 'success');
      fetchLists();
    } catch (err) {
      if (showToast) showToast('Erro ao criar lista.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenListDetails = async (listId) => {
    try {
      const res = await axios.get(`/api/lists/${listId}`);
      setSelectedList(res.data);
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-amber-400" /> Listas da Comunidade
          </h2>
          <p className="text-xs text-slate-400 mt-1">Explore listas temáticas criadas por cinéfilos ou crie a sua própria.</p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Criar Nova Lista
          </button>
        )}
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map(list => (
          <div 
            key={list.id}
            onClick={() => handleOpenListDetails(list.id)}
            className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-lg cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Poster Grid Preview (up to 4 movies) */}
              <div className="grid grid-cols-4 gap-1.5 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800/60 aspect-[16/7] overflow-hidden">
                {list.posters && list.posters.length > 0 ? (
                  list.posters.map((p, idx) => (
                    <img 
                      key={idx}
                      src={p.poster_path ? (p.poster_path.startsWith('http') ? p.poster_path : `https://image.tmdb.org/t/p/w200${p.poster_path}`) : 'https://via.placeholder.com/200x300'}
                      alt={p.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ))
                ) : (
                  <div className="col-span-4 flex items-center justify-center text-xs text-slate-600 font-medium">
                    Lista Vazia
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {list.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {list.description || 'Sem descrição.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 mt-4 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <img 
                  src={list.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${list.username}`} 
                  alt={list.user_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-300">@{list.username}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" /> {list.movie_count}</span>
                <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3.5 h-3.5 fill-rose-400" /> {list.likes_count}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Create List Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Criar Nova Lista</h3>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título da Lista</label>
                <input 
                  type="text"
                  required
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="ex: Filmes Sci-Fi dos Anos 80"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea 
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Sobre o que é esta lista?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {creating ? 'Criando...' : 'Salvar Lista'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* List Details Modal */}
      {selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedList(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white">{selectedList.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Por @{selectedList.username}</p>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">{selectedList.description}</p>

            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filmes na Lista ({selectedList.movies?.length || 0})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {selectedList.movies?.map(m => (
                  <div key={m.id} onClick={() => { setSelectedList(null); onSelectMovie(m); }} className="cursor-pointer">
                    <img 
                      src={m.poster_path ? (m.poster_path.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w300${m.poster_path}`) : 'https://via.placeholder.com/300x450'}
                      alt={m.title}
                      className="w-full aspect-[2/3] object-cover rounded-xl border border-slate-800 hover:border-amber-400 transition-all"
                    />
                    <h4 className="text-xs font-bold text-slate-200 mt-2 truncate">{m.title}</h4>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
