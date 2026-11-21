import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Play, Info, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function GameCard({ game, onFavouriteToggle }) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(Boolean(game.is_favourite));
  const [loadingFav, setLoadingFav] = useState(false);
  const navigate = useNavigate();

  const handleFavClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoadingFav(true);
      if (isFav) {
        await api.removeFavourite(game.id);
        setIsFav(false);
      } else {
        await api.addFavourite(game.id);
        setIsFav(true);
      }
      if (onFavouriteToggle) onFavouriteToggle(game.id, !isFav);
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const isPlayable = game.status === 'playable';

  return (
    <div className="group relative bg-[#0d1017] border border-white/5 rounded-2xl overflow-hidden neon-border-hover flex flex-col justify-between transition-all duration-300">
      
      {/* Thumbnail Area */}
      <Link 
        to={isPlayable ? `/play/${game.slug || game.id}` : `/games/${game.slug || game.id}`}
        className="block relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
      >
        <img
          src={game.thumbnail || '/images/thumbnails/default.jpg'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback SVG graphic
            e.target.src = '/logo.svg';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Status Badge */}
          {isPlayable ? (
            <span className="badge-playable px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Playable
            </span>
          ) : game.status === 'coming_soon' ? (
            <span className="badge-coming-soon px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-md">
              Coming Soon
            </span>
          ) : (
            <span className="badge-experimental px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-md">
              Experimental
            </span>
          )}

          {/* Favourite Button */}
          <button
            onClick={handleFavClick}
            disabled={loadingFav}
            className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-slate-300 hover:text-rose-500 border border-white/10 transition-all hover:scale-110 active:scale-95"
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Launch Type Pill */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="bg-black/70 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-tech text-cyan-300 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            {game.launch_type ? game.launch_type.replace('_', ' ') : 'Browser'}
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase font-tech">
              {game.genre}
            </span>
          </div>

          <Link
            to={isPlayable ? `/play/${game.slug || game.id}` : `/games/${game.slug || game.id}`}
            className="block"
          >
            <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {game.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          {isPlayable ? (
            <Link
              to={`/play/${game.slug || game.id}`}
              className="btn-primary flex-1 py-2 text-xs uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Now
            </Link>
          ) : (
            <Link
              to={`/games/${game.slug || game.id}`}
              className="btn-secondary flex-1 py-2 text-xs uppercase tracking-wider text-slate-400"
            >
              <Info className="w-3.5 h-3.5" />
              Overview
            </Link>
          )}

          <Link
            to={`/games/${game.slug || game.id}`}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="View Details & Controls"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}
