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
  const articles = data?.articles || [];
  return articles.map(article => ({
    title: stripHtml(article.title || ''),
    description: stripHtml(article.description || ''),
    link: article.url,
    pubDate: article.publishedAt,
  }));
}

async function getNews(category = 'it', count = 5) {
  const cacheKey = `news_${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const query = CATEGORIES[category] || CATEGORIES.it;
  const { data } = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: query,
      language: 'ko',
      pageSize: count,
      sortBy: 'publishedAt',
    },
    headers: {
      'X-Api-Key': config.newsApiKey,
    },
  });

  const result = parseNewsResponse(data);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getNews, parseNewsResponse, CATEGORIES };
