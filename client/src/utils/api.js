import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

// 현재 위치 가져오기 (캐싱)
let cachedPosition = null;
function getCurrentPosition() {
  return new Promise((resolve) => {
    if (cachedPosition) return resolve(cachedPosition);
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedPosition = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        resolve(cachedPosition);
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 600000 } // 10분 캐시
    );
  });
}

export async function fetchDashboard() {
  const pos = await getCurrentPosition();
  const params = pos ? { lat: pos.lat, lon: pos.lon } : {};
  const { data } = await api.get('/dashboard', { params });
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
