const BASE_URL = '/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('gamecloud_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 && token) {
        // Token expired
        localStorage.removeItem('gamecloud_token');
        localStorage.removeItem('gamecloud_user');
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Games
  getGames: (params = '') => request(`/games${params ? '?' + params : ''}`),
  getGameById: (idOrSlug) => request(`/games/${idOrSlug}`),
  getCategories: () => request('/games/categories'),
  createGame: (body) => request('/games', { method: 'POST', body: JSON.stringify(body) }),
  updateGame: (id, body) => request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),

  // Sessions
  createSession: (gameId, executionType = 'browser') =>
    request('/sessions', { method: 'POST', body: JSON.stringify({ gameId, executionType }) }),
  stopSession: (sessionId, durationSeconds) =>
    request(`/sessions/${sessionId}/stop`, { method: 'PATCH', body: JSON.stringify({ durationSeconds }) }),
  getUserSessions: () => request('/sessions'),
  getAllSessions: () => request('/sessions/all'),

  // User
  getProfile: () => request('/users/profile'),
  getFavourites: () => request('/users/favourites'),
  addFavourite: (gameId) => request('/users/favourites', { method: 'POST', body: JSON.stringify({ gameId }) }),
  removeFavourite: (gameId) => request(`/users/favourites/${gameId}`, { method: 'DELETE' }),
  getPlayHistory: () => request('/users/history'),
  getAllUsers: () => request('/users/all')
};
