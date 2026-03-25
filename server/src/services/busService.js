const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(60 * 1000);

function formatArrivalTime(seconds) {
  if (typeof seconds === 'string') seconds = parseInt(seconds, 10);
  if (seconds <= 0 || isNaN(seconds)) return '정보없음';
  if (seconds < 60) return '곧 도착';
  return `${Math.floor(seconds / 60)}분`;
}

function formatPredictTime(minutes) {
  if (!minutes || minutes === '0') return '정보없음';
  return `${minutes}분`;
}

function parseBusArrival(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    routeId: item.routeId,
    routeName: item.routeName || item.rtNm || '',
    firstArrival: formatPredictTime(item.predictTime1 || item.arrmsg1),
    secondArrival: formatPredictTime(item.predictTime2 || item.arrmsg2),
    stationId: item.stationId || item.stId || '',
  }));
}

async function getGyeonggiBusArrival(stationId) {
  const cacheKey = `gg_bus_${stationId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = 'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList';
  const { data } = await axios.get(url, {
    params: { serviceKey: config.busApiKey, stationId },
  });

  const items = data?.response?.msgBody?.busArrivalList;
  const result = parseBusArrival(Array.isArray(items) ? items : items ? [items] : []);
  cache.set(cacheKey, result);
  return result;
}

async function getSeoulBusArrival(stId) {
  const cacheKey = `seoul_bus_${stId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid';
  const { data } = await axios.get(url, {
    params: { serviceKey: config.busApiKey, arsId: stId },
  });

  const { XMLParser } = require('fast-xml-parser');
  const parser = new XMLParser();
  const parsed = typeof data === 'string' ? parser.parse(data) : data;
  const items = parsed?.ServiceResult?.msgBody?.itemList;
  const result = parseBusArrival(Array.isArray(items) ? items : items ? [items] : []);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getGyeonggiBusArrival, getSeoulBusArrival, parseBusArrival, formatArrivalTime, formatPredictTime };
