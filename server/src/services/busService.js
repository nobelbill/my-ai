const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');
const { XMLParser } = require('fast-xml-parser');

const cache = new SimpleCache(60 * 1000); // 1분 캐시
const parser = new XMLParser();

function parseSeoulBusResponse(rawData) {
  const parsed = typeof rawData === 'string' ? parser.parse(rawData) : rawData;
  const items = parsed?.ServiceResult?.msgBody?.itemList;
  if (!items) return [];

  const list = Array.isArray(items) ? items : [items];
  return list.map(item => ({
    routeName: String(item.rtNm || ''),
    firstArrival: item.arrmsg1 || '정보없음',
    secondArrival: item.arrmsg2 || '정보없음',
    direction: item.adirection || '',
    stationName: item.stNm || '',
  }));
}

// 서울버스 API로 통합 (고양시 중앙차로 정류장도 조회 가능)
async function getBusArrival(arsId, routeFilter) {
  const cacheKey = `bus_${arsId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const baseUrl = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid';
  const qs = `serviceKey=${encodeURIComponent(config.busApiKey)}&arsId=${arsId}`;
  const { data } = await axios.get(`${baseUrl}?${qs}`);

  let result = parseSeoulBusResponse(data);

  // 특정 노선만 필터링
  if (routeFilter && routeFilter.length > 0) {
    result = result.filter(bus => routeFilter.includes(bus.routeName));
  }

  cache.set(cacheKey, result);
  return result;
}

module.exports = { getBusArrival, parseSeoulBusResponse };
