import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  ArrowLeft, 
  Gamepad2, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  Users, 
  Info,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GameDetailsPage() {
  const { idOrSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await api.getGameById(idOrSlug);
        if (res.success) {
          setGame(res.data);
          setIsFav(Boolean(res.data.is_favourite));
        }
      } catch (err) {
        console.error('Error fetching game details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [idOrSlug]);

  const handleToggleFav = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isFav) {
        await api.removeFavourite(game.id);
        setIsFav(false);
      } else {
        await api.addFavourite(game.id);
        setIsFav(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-heading font-bold text-2xl text-white">Game Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 mb-6">The requested game title does not exist in the catalogue.</p>
        <Link to="/games" className="btn-primary text-xs uppercase tracking-wider">
          Back to Library
        </Link>
      </div>
    );
  }

  const isPlayable = game.status === 'playable';
  const controlsList = typeof game.controls === 'object' && game.controls !== null 
    ? Object.entries(game.controls) 
    : [];

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Link */}
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-6 font-tech uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Game Library
        </Link>

        {/* Main Details Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Thumbnail Banner */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full aspect-[16/10] object-cover"
              onError={(e) => { e.target.src = '/logo.svg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-cyan-300 uppercase tracking-wider font-tech flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {game.launch_type}
              </span>

              <button
                onClick={handleToggleFav}
                className="pointer-events-auto p-2.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-slate-300 hover:text-rose-500 transition-all hover:scale-110"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Game Info & Launch CTA */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-tech">
                  {game.genre}
                </span>
                <span className="text-slate-600">&bull;</span>
                {isPlayable ? (
                  <span className="badge-playable px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Playable
                  </span>
                ) : (
                  <span className="badge-coming-soon px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {game.status.replace('_', ' ')}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
                {game.name}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed mt-4">
                {game.description}
              </p>
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              {isPlayable ? (
                <Link
                  to={`/play/${game.slug || game.id}`}
                  className="btn-primary w-full py-4 text-sm uppercase tracking-wider font-heading font-bold shadow-xl shadow-cyan-500/25"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Launch Game in Browser
                </Link>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-xs leading-relaxed">
                  <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-400">
                    <Info className="w-4 h-4" /> Technical Status: {game.status.toUpperCase()}
                  </div>
                  This title requires full Emscripten WebAssembly compilation or a remote hardware-accelerated container. Direct execution is not yet enabled on this localhost testbed.
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0e121a] border border-white/5 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 uppercase font-tech">Community Plays</span>
                <p className="font-heading font-bold text-lg text-white mt-0.5">{game.total_plays || 0}</p>
              </div>
              <div className="bg-[#0e121a] border border-white/5 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 uppercase font-tech">Saved to Favourites</span>
                <p className="font-heading font-bold text-lg text-cyan-400 mt-0.5">{game.total_favourites || 0}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Section: Controls & Technical Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 pt-10 border-t border-white/5">
          
          {/* Controls Scheme */}
          <div className="lg:col-span-6 bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              Keyboard Controls & Input Mapping
            </h3>

            {controlsList.length > 0 ? (
              <div className="space-y-3">
                {controlsList.map(([action, key]) => (
                  <div key={action} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-xs">
                    <span className="text-slate-300 font-medium">{action}</span>
                    <span className="bg-white/10 border border-white/15 text-cyan-300 font-mono px-2.5 py-1 rounded font-bold">
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Standard keyboard and mouse interaction.</p>
            )}
          </div>

          {/* Technical Engine Specs */}
          <div className="lg:col-span-6 bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Engine & Execution Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Execution Mode</span>
                <span className="text-white font-semibold">Mode 1: Browser Native</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Rendering Engine</span>
                <span className="text-cyan-400 font-semibold">{game.launch_type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Client Installation</span>
                <span className="text-emerald-400 font-semibold">Zero Installation Required</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">Audio Pipeline</span>
                <span className="text-purple-300 font-semibold">Web Audio API Synthesizer</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
