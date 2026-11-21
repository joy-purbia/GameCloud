import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Clock, 
  Gamepad2, 
  Heart, 
  History, 
  Sparkles, 
  Play, 
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('favourites');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [profRes, favRes, histRes] = await Promise.all([
        api.getProfile(),
        api.getFavourites(),
        api.getPlayHistory()
      ]);
      if (profRes.success) setProfile(profRes.data);
      if (favRes.success) setFavourites(favRes.data);
      if (histRes.success) setHistory(histRes.data);
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatPlayTime = (totalSecs) => {
    if (!totalSecs || totalSecs === 0) return '0 min';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* User Profile Header Card */}
        <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-[#090c14] rounded-[14px] flex items-center justify-center text-2xl font-black text-white font-heading">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <h1 className="font-heading font-black text-2xl text-white">
                    {user?.username}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user?.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {user?.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
                <p className="text-[11px] text-slate-500 font-tech mt-1 flex items-center gap-1 justify-center sm:justify-start">
                  <Calendar className="w-3.5 h-3.5" />
                  MEMBER SINCE {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Open Admin Control
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
            <div className="bg-[#111520] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-tech uppercase">Total Sessions</p>
                <p className="font-heading font-black text-xl text-white mt-0.5">
                  {profile?.stats?.totalSessions || 0}
                </p>
              </div>
            </div>

            <div className="bg-[#111520] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-tech uppercase">Play Time</p>
                <p className="font-heading font-black text-xl text-white mt-0.5">
                  {formatPlayTime(profile?.stats?.totalPlayTimeSeconds)}
                </p>
              </div>
            </div>

            <div className="bg-[#111520] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-tech uppercase">Saved Favourites</p>
                <p className="font-heading font-black text-xl text-white mt-0.5">
                  {favourites.length}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Tabs */}
        <div>
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('favourites')}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'favourites'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              My Favourites ({favourites.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Play History ({history.length})
            </button>
          </div>

          {/* Tab 1: Favourites */}
          {activeTab === 'favourites' && (
            <div className="mt-6">
              {favourites.length === 0 ? (
                <div className="bg-[#0c1017] border border-white/5 rounded-2xl p-12 text-center">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-base text-white">No Favourites Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Bookmark your favourite games to access them quickly anytime from this library.
                  </p>
                  <Link to="/games" className="btn-primary text-xs uppercase tracking-wider">
                    Browse All Games
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favourites.map(game => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      onFavouriteToggle={() => loadDashboard()} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Play History */}
          {activeTab === 'history' && (
            <div className="mt-6 bg-[#0c1017] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              {history.length === 0 ? (
                <div className="p-12 text-center">
                  <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-base text-white">No Gameplay Recorded Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Launch Neon Racer or 2048 to start recording your active game sessions!
                  </p>
                  <Link to="/play/neon-racer" className="btn-primary text-xs uppercase tracking-wider">
                    Play Neon Racer
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111520] text-slate-400 uppercase font-tech tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Genre</th>
                        <th className="py-3 px-4">Total Play Time</th>
                        <th className="py-3 px-4">Last Played</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {history.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white flex items-center gap-3">
                            <img
                              src={item.thumbnail}
                              alt={item.game_name}
                              className="w-10 h-7 rounded object-cover"
                              onError={(e) => { e.target.src = '/logo.svg'; }}
                            />
                            <span>{item.game_name}</span>
                          </td>
                          <td className="py-3 px-4 text-purple-400 font-tech font-bold uppercase">
                            {item.genre}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                            {formatPlayTime(item.total_play_time_seconds)}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-tech">
                            {new Date(item.last_played_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.status === 'playable' && (
                              <Link
                                to={`/play/${item.game_slug || item.game_id}`}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Resume
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
