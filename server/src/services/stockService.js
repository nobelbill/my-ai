const axios = require('axios');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(5 * 60 * 1000); // 5분 캐시

// 종목 코드 매핑
const STOCK_SYMBOLS = {
  // 한국 주식 (m.stock.naver.com)
  '두산에너빌리티': { code: '034020', type: 'kr' },
  '3S': { code: '060310', type: 'kr' },
  // 미국 주식 (api.stock.naver.com)
  '루시드': { code: 'LCID.O', type: 'us' },
  'KORU': { code: 'KORU.K', type: 'us' },
  '로켓랩': { code: 'RKLB.O', type: 'us' },
  'ASTS': { code: 'ASTS.O', type: 'us' },
};

const headers = { 'User-Agent': 'Mozilla/5.0 MyAI-Dashboard/1.0' };

async function fetchKrStock(code) {
  const { data } = await axios.get(`https://m.stock.naver.com/api/stock/${code}/basic`, { headers });
  return {
    name: data.stockName,
    code,
    price: data.closePrice,
    change: data.compareToPreviousClosePrice,
    changeRate: data.fluctuationsRatio,
    status: data.compareToPreviousPrice?.name, // RISING, FALLING, EVEN
    statusText: data.compareToPreviousPrice?.text,
    logoUrl: data.itemLogoPngUrl || data.itemLogoUrl,
    market: 'KR',
  };
}

async function fetchUsStock(code) {
  const { data } = await axios.get(`https://api.stock.naver.com/stock/${code}/basic`, { headers });
  return {
    name: data.stockName || data.stockNameEng,
    code,
    price: data.closePrice,
    change: data.compareToPreviousClosePrice,
    changeRate: data.fluctuationsRatio,
    status: data.compareToPreviousPrice?.name,
    statusText: data.compareToPreviousPrice?.text,
    logoUrl: data.itemLogoPngUrl || data.itemLogoUrl,
    market: 'US',
  };
}

async function getStocks(symbols) {
  const cacheKey = 'stocks_' + symbols.join(',');
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const results = [];
  for (const name of symbols) {
    const sym = STOCK_SYMBOLS[name];
    if (!sym) continue;
    try {
      const stock = sym.type === 'kr'
        ? await fetchKrStock(sym.code)
        : await fetchUsStock(sym.code);
      results.push(stock);
    } catch (err) {
      console.error(`Stock fetch error [${name}]:`, err.message);
    }
  }

  cache.set(cacheKey, results);
  return results;
}

module.exports = { getStocks, STOCK_SYMBOLS };
