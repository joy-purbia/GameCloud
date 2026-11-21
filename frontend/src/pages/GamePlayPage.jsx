import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import GamePlayer from '../components/GamePlayer';
import { DEFAULT_GAMES } from '../data/defaultGames';

// Index default games by slug and id for instantaneous offline / direct launch
const LOCAL_GAMES = {};
DEFAULT_GAMES.forEach(g => {
  LOCAL_GAMES[g.slug] = g;
  LOCAL_GAMES[String(g.id)] = g;
});

export default function GamePlayPage() {
  const { idOrSlug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const res = await api.getGameById(idOrSlug);
        if (res && res.success && res.data) {
          setGame(res.data);
          return;
        }
      } catch (err) {
        console.warn('API lookup offline, using browser-native fallback:', err.message);
      } finally {
        setLoading(false);
      }

      // Seamless direct fallback: if backend is offline, run directly from local bundle
      if (LOCAL_GAMES[idOrSlug]) {
        setGame(LOCAL_GAMES[idOrSlug]);
      }
    };

    fetchGame();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-tech uppercase tracking-widest">
          LAUNCHING BROWSER ENGINE...
        </p>
      </div>
    );
  }

  // Active game (from DB or direct local fallback)
  const activeGame = game || LOCAL_GAMES[idOrSlug];

  if (!activeGame) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="font-heading font-bold text-2xl text-white">Game Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The game identifier "{idOrSlug}" is not available in the library.
        </p>
        <Link to="/games" className="btn-primary text-xs uppercase tracking-wider">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8 max-w-7xl mx-auto flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 font-tech uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Viewport
        </Link>
        <div className="text-xs text-slate-500 font-tech uppercase">
          MODE: {activeGame.launch_type || 'browser_webgl'} &bull; DIRECT BROWSER EXECUTION
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <GamePlayer game={activeGame} />
      </div>
    </div>
  );
}
