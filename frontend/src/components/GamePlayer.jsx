import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  X, 
  HelpCircle, 
  Clock, 
  Gamepad2,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GamePlayer({ game }) {
  const { refreshUser } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  const playerContainerRef = useRef(null);
  const navigate = useNavigate();

  // 1. Initialize Game Session in Database
  useEffect(() => {
    let currentSessionId = null;

    const startSession = async () => {
      try {
        const res = await api.createSession(game.id, 'browser');
        if (res.success) {
          currentSessionId = res.data.sessionId;
          setSessionId(currentSessionId);
        }
      } catch (err) {
        console.warn('Session tracking notice:', err.message);
      }
    };

    startSession();

    // Session Timer
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    // Stop session when leaving component
    return () => {
      clearInterval(timer);
      if (currentSessionId) {
        setSessionSeconds(finalDuration => {
          api.stopSession(currentSessionId, finalDuration)
            .then(() => refreshUser())
            .catch(e => console.warn('Stop session error:', e.message));
          return finalDuration;
        });
      }
    };
  }, [game.id]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err.message);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRestart = () => {
    setIframeKey(Date.now());
  };

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate('/games');
  };

  // Format timer into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const controlsList = typeof game.controls === 'object' && game.controls !== null 
    ? Object.entries(game.controls) 
    : [];

  return (
    <div 
      ref={playerContainerRef} 
      className={`relative w-full flex flex-col bg-[#050609] ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[85vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl'
      }`}
    >
      {/* Top Gaming Bar */}
      <div className="bg-[#0b0e17] border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-20 select-none">
        
        {/* Game Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-white tracking-wide flex items-center gap-2">
              {game.name}
              <span className="text-[10px] text-cyan-400 font-tech font-normal px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 uppercase">
                {game.genre}
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Live Play Timer */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5 font-tech text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>PLAY TIME:</span>
          <span className="font-mono font-bold text-cyan-300">{formatTime(sessionSeconds)}</span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {controlsList.length > 0 && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
              title="View Controls"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleRestart}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-purple-400 border border-white/5 transition-colors"
            title="Restart Game (Reload)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border border-white/5 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExit}
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-colors ml-1"
            title="Exit Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full h-full min-h-0 bg-black">
        {game.status === 'playable' && game.launch_url ? (
          <iframe
            key={iframeKey}
            src={game.launch_url}
            title={game.name}
            className="w-full h-full border-0 outline-none block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            onLoad={(e) => {
              try {
                e.target.contentWindow?.focus();
              } catch (err) {}
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#07090e]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-xl text-white mb-2">
              Game Currently In Development
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              <b>{game.name}</b> is catalogued as <span className="text-amber-400 uppercase font-semibold">{game.status}</span>. You can play <b>Neon Racer 3D</b> and <b>2048</b> directly in your browser right now!
            </p>
            <button
              onClick={() => navigate('/games')}
              className="btn-primary text-xs uppercase tracking-wider"
            >
              Back to Game Library
            </button>
          </div>
        )}

        {/* Controls Overlay Modal */}
        {showControls && controlsList.length > 0 && (
          <div className="absolute top-4 right-4 z-30 max-w-xs w-full bg-[#0d111b]/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="font-heading font-bold text-cyan-400 uppercase tracking-wider">
                Game Controls
              </span>
              <button 
                onClick={() => setShowControls(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {controlsList.map(([action, key]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-slate-400">{action}</span>
                  <span className="bg-white/10 text-cyan-300 font-mono px-2 py-0.5 rounded font-bold">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
