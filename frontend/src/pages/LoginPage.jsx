import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier, password);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCreds = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0c1017] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="font-heading font-black text-2xl text-white">ACCESS GAMECLOUD</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to track your high scores and play history.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-tech">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or player1"
                className="w-full bg-[#111520] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-tech">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111520] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-heading mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Platform'}
          </button>
        </form>

        {/* Quick Demo Credentials for Evaluation */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider font-tech mb-2.5 text-center">
            Quick Auto-Fill For Testing
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickCreds('admin', 'Joy@2006')}
              className="py-1.5 px-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-tech font-bold transition-colors"
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCreds('player1', 'Joy@2006')}
              className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-tech font-bold transition-colors"
            >
              Fill Player1
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
              Create One Free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
