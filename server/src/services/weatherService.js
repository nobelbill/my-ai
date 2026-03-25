const axios = require('axios');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(30 * 60 * 1000);

// 위치별 위경도 (Open-Meteo용)
const LOCATIONS = {
  goyang: { lat: 37.6584, lon: 126.8320, name: '고양시' },
  gangnam: { lat: 37.4979, lon: 127.0276, name: '강남구' },
};

function getLocation(location) {
  return LOCATIONS[location] || LOCATIONS.goyang;
}

// WMO Weather Code → 한국어
const WMO_SKY = {
  0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
  45: '안개', 48: '안개',
  51: '이슬비', 53: '이슬비', 55: '이슬비',
  61: '비', 63: '비', 65: '폭우',
  71: '눈', 73: '눈', 75: '폭설',
  80: '소나기', 81: '소나기', 82: '폭우',
  95: '뇌우', 96: '뇌우', 99: '뇌우',
};

const WMO_PRECIPITATION = {
  0: '없음', 1: '없음', 2: '없음', 3: '없음',
  45: '없음', 48: '없음',
  51: '이슬비', 53: '이슬비', 55: '이슬비',
  61: '비', 63: '비', 65: '비',
  71: '눈', 73: '눈', 75: '눈',
  80: '소나기', 81: '소나기', 82: '소나기',
  95: '비', 96: '비', 99: '비',
};

function parseWeatherResponse(data) {
  const current = data?.current;
  if (!current) return null;

  const code = current.weather_code;
  return {
    temperature: String(Math.round(current.temperature_2m)),
    sky: WMO_SKY[code] || '알 수 없음',
    precipitation: WMO_PRECIPITATION[code] || '없음',
    rainProbability: '0',
    humidity: String(current.relative_humidity_2m || '-'),
    windSpeed: String(Math.round((current.wind_speed_10m || 0) / 3.6 * 10) / 10), // km/h → m/s
  };
}

// 위경도 → 지역명 변환 (Open-Meteo geocoding reverse 대신 간단한 주소 API 사용)
async function getLocationName(lat, lon) {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', 'accept-language': 'ko', zoom: 10 },
      headers: { 'User-Agent': 'MyAI-Dashboard/1.0' },
    });
    // 시/구 단위로 표시
    const addr = data.address || {};
    return addr.city || addr.county || addr.town || addr.suburb || addr.state || '현재 위치';
  } catch {
    return '현재 위치';
  }
}

async function getWeather(location = 'goyang', lat, lon) {
  // GPS 좌표가 있으면 해당 좌표 사용, 없으면 프리셋 위치
  const useLat = lat || getLocation(location).lat;
  const useLon = lon || getLocation(location).lon;
  const cacheKey = `weather_${useLat}_${useLon}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: useLat,
      longitude: useLon,
      current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
      timezone: 'Asia/Seoul',
    },
  });

  const result = parseWeatherResponse(data);

  // GPS 좌표가 있으면 역지오코딩, 없으면 프리셋 이름
  if (lat && lon) {
    result.location = await getLocationName(lat, lon);
  } else {
    result.location = getLocation(location).name;
  }

  cache.set(cacheKey, result);
  return result;
}

module.exports = { getWeather, parseWeatherResponse, getLocation };
