import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import GameLibraryPage from './pages/GameLibraryPage';
import GameDetailsPage from './pages/GameDetailsPage';
import GamePlayPage from './pages/GamePlayPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-heading font-black text-6xl text-cyan-400 mb-2">404</h1>
      <h2 className="font-heading font-bold text-2xl text-white mb-2">SECTOR UNEXPLORED</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The gaming route or resource you are attempting to locate does not exist.
      </p>
      <Link to="/" className="btn-primary text-xs uppercase tracking-wider">
        Return to Platform Hub
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#07090e] text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GameLibraryPage />} />
              <Route path="/games/:idOrSlug" element={<GameDetailsPage />} />
              <Route path="/play/:idOrSlug" element={<GamePlayPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
