import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, 
  Search, 
  User, 
  LogOut, 
  ShieldAlert, 
  Sparkles, 
  Bookmark, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
              GAMECLOUD
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 font-tech uppercase -mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LOCALHOST READY
            </span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search games, genres, engines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#10141f] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </form>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/games"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/games') ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Browse Games
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              My Library
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin') ? 'text-purple-400 bg-purple-500/10' : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>

        {/* User Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2.5 bg-[#121622] border border-white/10 hover:border-cyan-500/40 rounded-full py-1.5 px-3 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
                  {user?.username}
                </span>
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-[#0e121b] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                        ADMINISTRATOR
                      </span>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    My Library & History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-purple-300 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      Admin Control
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-xs uppercase tracking-wider py-2 px-4"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
          <form onSubmit={handleSearch} className="flex items-center relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10141f] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
          >
            Browse Games
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
            >
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-lg"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-2 border-t border-white/5">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-rose-400"
              >
                Sign Out ({user?.username})
              </button>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm text-slate-300 bg-white/5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
