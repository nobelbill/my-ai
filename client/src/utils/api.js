import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

export async function fetchDashboard() {
  const { data } = await api.get('/dashboard');
  return data.data;
}

export async function fetchWeather(location) {
  const { data } = await api.get('/weather', { params: { location } });
  return data.data;
}

export async function fetchBus(type, stationId) {
  const endpoint = type === 'commute' ? '/bus/commute' : '/bus/home';
  const { data } = await api.get(endpoint, { params: { stationId } });
  return data.data;
}

export async function fetchNews(category) {
  const { data } = await api.get('/news', { params: { category } });
  return data.data;
}

export async function fetchMessage() {
  const { data } = await api.get('/message');
  return data.data;
}

export async function fetchSettings() {
  const { data } = await api.get('/settings');
  return data.data;
}

export async function updateSettings(settings) {
  const { data } = await api.put('/settings', settings);
  return data.data;
}
