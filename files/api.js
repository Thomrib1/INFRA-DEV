/**
 * YMMO — API Client
 * Toutes les requêtes vers le back Express (localhost:3000)
 */

const API_BASE = `http://${window.location.hostname}:3000/api`;

// AUTH TOKEN
const Auth = {
  getToken: () => localStorage.getItem('ymmo_token'),
  getUser: () => {
    const u = localStorage.getItem('ymmo_user');
    return u ? JSON.parse(u) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem('ymmo_token', token);
    localStorage.setItem('ymmo_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('ymmo_token');
    localStorage.removeItem('ymmo_user');
  },
  isLoggedIn: () => !!localStorage.getItem('ymmo_token'),
};

// REQUÊTE GÉNÉRIQUE
async function apiRequest(method, endpoint, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

// AGENCES
const AgenciesAPI = {
  getAll: () => apiRequest('GET', '/agencies'),
  create: (payload) => apiRequest('POST', '/agencies', payload, true),
};

// AUTH
const AuthAPI = {
  login: (email, password) =>
    apiRequest('POST', '/auth/login', { email, password }),
  register: (payload) =>
    apiRequest('POST', '/auth/register', payload),
};

// PROPERTIES
const PropertiesAPI = {
  getAll: () => apiRequest('GET', '/properties'),
  create: (payload) => apiRequest('POST', '/properties', payload, true),
};
