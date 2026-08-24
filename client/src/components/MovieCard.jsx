import React from 'react';
import { Star, Eye, Bookmark, Heart } from 'lucide-react';

export default function MovieCard({ movie, onClick }) {
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://via.placeholder.com/500x750/0f172a/94a3b8?text=Sem+Poster';

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1 border border-slate-800 hover:border-slate-700"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-700/50 text-xs font-semibold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        )}

        {/* Status indicator badge if present */}
        {movie.user_status && (
          <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            {movie.user_status === 'JA_VI' ? 'Já Vi' : movie.user_status === 'QUERO_VER' ? 'Quero Ver' : movie.user_status}
          </div>
        )}

        {/* Hover overlay with action preview */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-xs text-amber-400 font-medium">{year}</p>
          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">{movie.title}</h4>
          
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <Eye className="w-3.5 h-3.5" /> Ver Detalhes
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 bg-slate-900/90">
        <h3 className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5 flex justify-between">
          <span>{year}</span>
          {movie.genres && movie.genres[0] && (
            <span className="truncate max-w-[90px]">{movie.genres[0].name}</span>
          )}
        </p>
      </div>
    </div>
  );
}
