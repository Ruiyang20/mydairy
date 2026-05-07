import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('diary_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('diary_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login   = (password) => api.post('/auth/login', { password }).then(r => r.data);
export const verify  = ()         => api.post('/auth/verify').then(r => r.data);

// ── Entries ───────────────────────────────────────────────────────────────────
export const fetchEntries = (params = {}) => api.get('/entries', { params }).then(r => r.data);
export const fetchEntry   = (id)          => api.get(`/entries/${id}`).then(r => r.data);
export const fetchStats   = ()            => api.get('/entries/stats').then(r => r.data);
export const createEntry  = (data)        => api.post('/entries', data).then(r => r.data);
export const updateEntry  = (id, data)    => api.put(`/entries/${id}`, data).then(r => r.data);
export const deleteEntry  = (id)          => api.delete(`/entries/${id}`).then(r => r.data);

export default api;
