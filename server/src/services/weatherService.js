const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(30 * 60 * 1000);

const GRID_COORDS = {
  goyang: { nx: 57, ny: 128 },
  gangnam: { nx: 61, ny: 126 },
};

function getNxNy(location) {
  return GRID_COORDS[location] || GRID_COORDS.goyang;
}

const SKY_MAP = { '1': '맑음', '3': '구름많음', '4': '흐림' };
const PTY_MAP = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };

function parseWeatherResponse(data) {
  const items = data.response?.body?.items?.item || [];
  const map = {};
  items.forEach(item => { map[item.category] = item.fcstValue; });

  return {
    temperature: map.TMP || map.T1H || '-',
    sky: SKY_MAP[map.SKY] || '알 수 없음',
    precipitation: PTY_MAP[map.PTY] || '알 수 없음',
    rainProbability: map.POP || '0',
    humidity: map.REH || '-',
    windSpeed: map.WSD || '-',
  };
}

async function getWeather(location = 'goyang') {
  const cacheKey = `weather_${location}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { nx, ny } = getNxNy(location);
  const now = new Date();
  const baseDate = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

  const hours = now.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseTime = '0200';
  for (const bt of baseTimes) {
    if (hours >= bt + 1) baseTime = String(bt).padStart(2, '0') + '00';
  }

  // 공공데이터포털 인코딩 키는 이미 URL-encoded 상태이므로 직접 URL에 붙임 (이중 인코딩 방지)
  const baseUrl = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
  const qs = `serviceKey=${encodeURIComponent(config.weatherApiKey)}&numOfRows=50&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
  const { data } = await axios.get(`${baseUrl}?${qs}`);

  const result = parseWeatherResponse(data);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getWeather, parseWeatherResponse, getNxNy };
