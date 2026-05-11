import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// ── Auth ──────────────────────────────────────────────────────────────────────
// ── Entries ───────────────────────────────────────────────────────────────────
export const fetchEntries = (params = {}) => api.get('/entries', { params }).then(r => r.data);
export const fetchEntry   = (id)          => api.get(`/entries/${id}`).then(r => r.data);
export const fetchStats   = ()            => api.get('/entries/stats').then(r => r.data);
export const createEntry  = (data)        => api.post('/entries', data).then(r => r.data);
export const updateEntry  = (id, data)    => api.put(`/entries/${id}`, data).then(r => r.data);
export const deleteEntry  = (id)          => api.delete(`/entries/${id}`).then(r => r.data);

// ── Wings ────────────────────────────────────────────────────────────────────
export const fetchWings = () => api.get('/wings').then(r => r.data);
export const createWing = (data) => api.post('/wings', data).then(r => r.data);
export const updateWing = (roomId, data) => api.put(`/wings/${roomId}`, data).then(r => r.data);

export default api;
