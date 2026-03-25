const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(15 * 60 * 1000);

const CATEGORIES = {
  it: 'IT 기술',
  economy: '경제 금융',
  politics: '정치 사회',
};

function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '');
}

function parseNewsResponse(data) {
  const items = data?.items || [];
  return items.map(item => ({
    title: stripHtml(item.title),
    description: stripHtml(item.description),
    link: item.originallink || item.link,
    pubDate: item.pubDate,
  }));
}

async function getNews(category = 'it', count = 5) {
  const cacheKey = `news_${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const query = CATEGORIES[category] || CATEGORIES.it;
  const { data } = await axios.get('https://openapi.naver.com/v1/search/news.json', {
    params: { query, display: count, sort: 'date' },
    headers: {
      'X-Naver-Client-Id': config.naverClientId,
      'X-Naver-Client-Secret': config.naverClientSecret,
    },
  });

  const result = parseNewsResponse(data);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getNews, parseNewsResponse, CATEGORIES };
