import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Gamepad2, X } from 'lucide-react';
import { api } from '../services/api';
import GameCard from '../components/GameCard';

export default function GameLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    // Sync URL search params
    const qSearch = searchParams.get('search');
    const qGenre = searchParams.get('genre');
    if (qSearch !== null) setSearch(qSearch);
    if (qGenre !== null) setGenre(qGenre);
  }, [searchParams]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (genre && genre !== 'all') params.append('genre', genre);
      if (status && status !== 'all') params.append('status', status);
      if (sort) params.append('sort', sort);

      const res = await api.getGames(params.toString());
      if (res.success) {
        setGames(res.data);
      }
    } catch (err) {
      console.error('Error fetching games library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (e) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGames();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, genre, status, sort]);

  const clearFilters = () => {
    setSearch('');
    setGenre('all');
    setStatus('all');
    setSort('popular');
    setSearchParams({});
  };

  const hasActiveFilters = search || genre !== 'all' || status !== 'all';

  return (
    <div className="min-h-screen py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            EXPLORE GAME LIBRARY
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Browse our complete catalogue of browser-based WebGL, Canvas, and future cloud-streamed games.
          </p>
        </div>

        {/* Filter Bar Controls */}
        <div className="bg-[#0c1017] border border-white/10 rounded-2xl p-5 mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-xl">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by game title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111520] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Selector */}
            <div className="flex items-center gap-2">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="bg-[#111520] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all">All Genres</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#111520] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="playable">Playable Only</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="experimental">Experimental</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-[#111520] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Recently Added</option>
              <option value="name_asc">Title (A - Z)</option>
              <option value="name_desc">Title (Z - A)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <span>SHOWING {games.length} AVAILABLE TITLES</span>
          {genre !== 'all' && (
            <span className="text-cyan-400 font-semibold font-tech uppercase">
              FILTER: {genre}
            </span>
          )}
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="py-20 text-center bg-[#0c1017] rounded-2xl border border-white/5">
            <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-white">No Games Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't find any games matching your current filters. Try resetting your search or genre.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary text-xs uppercase tracking-wider mt-4"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
