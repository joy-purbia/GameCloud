import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit, 
  Gamepad2, 
  Users, 
  Activity, 
  Clock, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardPage() {
  const [games, setGames] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);

  // Add/Edit Game Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/default.jpg',
    launch_type: 'browser_webgl',
    launch_url: '',
    status: 'playable'
  });
  const [formMsg, setFormMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesRes, sessRes, usersRes, catRes] = await Promise.all([
        api.getGames(''),
        api.getAllSessions(),
        api.getAllUsers(),
        api.getCategories()
      ]);
      if (gamesRes.success) setGames(gamesRes.data);
      if (sessRes.success) setSessions(sessRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingGame(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      genre: categories[0]?.name || 'Racing',
      thumbnail: '/images/thumbnails/default.jpg',
      launch_type: 'browser_webgl',
      launch_url: '',
      status: 'playable'
    });
    setFormMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      slug: game.slug,
      description: game.description || '',
      genre: game.genre,
      thumbnail: game.thumbnail || '/images/thumbnails/default.jpg',
      launch_type: game.launch_type || 'browser_webgl',
      launch_url: game.launch_url || '',
      status: game.status || 'playable'
    });
    setFormMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGame) {
        await api.updateGame(editingGame.id, formData);
      } else {
        await api.createGame(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormMsg(err.message || 'Operation failed');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    try {
      await api.deleteGame(gameId);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-tech font-bold text-xs uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>SUPERUSER ACCESS</span>
            </div>
            <h1 className="font-heading font-black text-3xl text-white mt-1">
              ADMIN CONTROL PANEL
            </h1>
          </div>

          <button
            onClick={openCreateModal}
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 font-heading"
          >
            <Plus className="w-4 h-4" /> Add New Game
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-tech uppercase">Total Games</p>
              <p className="font-heading font-black text-2xl text-white mt-0.5">{games.length}</p>
            </div>
          </div>

          <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-tech uppercase">Registered Users</p>
              <p className="font-heading font-black text-2xl text-white mt-0.5">{users.length}</p>
            </div>
          </div>

          <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-tech uppercase">Logged Sessions</p>
              <p className="font-heading font-black text-2xl text-white mt-0.5">{sessions.length}</p>
            </div>
          </div>

          <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-tech uppercase">Playable Ratio</p>
              <p className="font-heading font-black text-2xl text-amber-400 mt-0.5">
                {games.filter(g => g.status === 'playable').length} / {games.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider ${
              activeTab === 'games'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Games Catalogue ({games.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider ${
              activeTab === 'sessions'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recent Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered Users ({users.length})
          </button>
        </div>

        {/* TAB 1: GAMES TABLE */}
        {activeTab === 'games' && (
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111520] text-slate-400 uppercase font-tech tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Genre</th>
                    <th className="py-3 px-4">Launch Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {games.map(g => (
                    <tr key={g.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={g.thumbnail}
                          alt={g.name}
                          className="w-10 h-7 rounded object-cover"
                          onError={(e) => { e.target.src = '/logo.svg'; }}
                        />
                        <span>{g.name}</span>
                      </td>
                      <td className="py-3 px-4 text-purple-400 font-tech font-bold uppercase">{g.genre}</td>
                      <td className="py-3 px-4 text-cyan-300 font-tech uppercase">{g.launch_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          g.status === 'playable' ? 'badge-playable' : 'badge-coming-soon'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                          title="Edit Game"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(g.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                          title="Delete Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SESSIONS TABLE */}
        {activeTab === 'sessions' && (
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111520] text-slate-400 uppercase font-tech tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Session ID</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Started At</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {sessions.map(s => (
                    <tr key={s.session_id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">{s.session_id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{s.username || 'Guest Pilot'}</td>
                      <td className="py-3 px-4 text-purple-300">{s.game_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">{s.duration_seconds}s</td>
                      <td className="py-3 px-4 text-slate-400 font-tech">{new Date(s.started_at).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USERS TABLE */}
        {activeTab === 'users' && (
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111520] text-slate-400 uppercase font-tech tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Total Sessions</th>
                    <th className="py-3 px-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white">{u.username}</td>
                      <td className="py-3 px-4 text-slate-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{u.total_sessions || 0}</td>
                      <td className="py-3 px-4 text-slate-400 font-tech">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1017] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-heading font-black text-xl text-white mb-4">
              {editingGame ? 'EDIT GAME' : 'ADD NEW GAME TO CATALOGUE'}
            </h2>

            {formMsg && (
              <p className="text-xs text-rose-400 mb-3">{formMsg}</p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-tech font-bold mb-1">Game Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-tech font-bold mb-1">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-tech font-bold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="playable">Playable</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="experimental">Experimental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-tech font-bold mb-1">Launch URL (Iframe / Path)</label>
                <input
                  type="text"
                  value={formData.launch_url}
                  onChange={(e) => setFormData({ ...formData, launch_url: e.target.value })}
                  placeholder="/games/my-game/index.html"
                  className="w-full bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-tech font-bold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full bg-[#111520] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 uppercase tracking-wider font-heading mt-2"
              >
                {editingGame ? 'Save Changes' : 'Create Game'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
