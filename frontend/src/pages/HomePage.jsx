import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Gamepad2, 
  Zap, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import GameCard from '../components/GameCard';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [gamesRes, catRes] = await Promise.all([
          api.getGames(''),
          api.getCategories()
        ]);
        if (gamesRes.success) setGames(gamesRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const playableGames = games.filter(g => g.status === 'playable');
  const featuredGame = games.find(g => g.slug === 'neon-racer') || games[0];

  return (
    <div className="min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 border-b border-white/5">
        {/* Neon Ambient Background Blurs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>FRESH START &bull; PURE BROWSER GAMING</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-heading">
              NEXT-GEN CLOUD GAMING{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                IN YOUR BROWSER
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Experience genuine high-performance 3D WebGL and Canvas gaming right on localhost. Zero downloads, zero manual installations, and instant game sessions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/play/neon-racer"
                className="btn-primary text-sm uppercase tracking-wider py-3.5 px-7 shadow-lg shadow-cyan-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Neon Racer 3D
              </Link>
              <Link
                to="/games"
                className="btn-secondary text-sm uppercase tracking-wider py-3.5 px-6"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                Explore Catalogue
              </Link>
            </div>

            {/* Platform Trust Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 w-full max-w-lg">
              <div>
                <p className="font-heading font-black text-2xl text-white">100%</p>
                <p className="text-xs text-slate-400">Browser Native</p>
              </div>
              <div>
                <p className="font-heading font-black text-2xl text-cyan-400">60+ FPS</p>
                <p className="text-xs text-slate-400">Three.js Engine</p>
              </div>
              <div>
                <p className="font-heading font-black text-2xl text-purple-400">0 MB</p>
                <p className="text-xs text-slate-400">Client Download</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Featured Game Spotlight Card */}
          {featuredGame && (
            <div className="lg:col-span-5 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-[#0c1018] border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl">
                <div className="aspect-[16/10] rounded-xl overflow-hidden relative">
                  <img
                    src={featuredGame.thumbnail}
                    alt={featuredGame.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/40 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    FEATURED GAME OF THE DAY
                  </div>
                </div>

                <div className="mt-4 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400 uppercase font-tech font-bold">
                      {featuredGame.genre} &bull; {featuredGame.launch_type}
                    </span>
                    <span className="badge-playable px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Playable Now
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-xl text-white mt-1">
                    {featuredGame.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {featuredGame.description}
                  </p>

                  <Link
                    to={`/play/${featuredGame.slug || featuredGame.id}`}
                    className="btn-primary w-full mt-4 py-2.5 text-xs uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play Instantly in Viewport
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. CATEGORIES FILTER BAR */}
      <section className="py-8 px-4 lg:px-8 border-b border-white/5 bg-[#0a0d14]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider shrink-0">
            BROWSE GENRES:
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/games"
              className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shrink-0"
            >
              All Games
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/games?genre=${encodeURIComponent(cat.name)}`}
                className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all shrink-0"
              >
                {cat.name} ({cat.game_count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PLAYABLE GAMES SHOWCASE */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest font-tech">
                <Flame className="w-4 h-4 text-cyan-400" />
                <span>READY TO LAUNCH</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
                Playable Games
              </h2>
            </div>

            <Link
              to="/games"
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold transition-colors"
            >
              View All Catalogue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playableGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. UPCOMING & EXPERIMENTAL SHOWCASE */}
      <section className="py-12 px-4 lg:px-8 bg-[#0a0d14]/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest font-tech">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>IN ACTIVE PIPELINE</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
                Catalogue & Experimental Ports
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.filter(g => g.status !== 'playable').map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
