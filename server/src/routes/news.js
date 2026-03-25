const express = require('express');
const { getNews, CATEGORIES } = require('../services/newsService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'it';
    const news = await getNews(category);
    res.json({ success: true, data: news, category });
  } catch (err) {
    console.error('News API error:', err.message);
    res.status(500).json({ success: false, error: '뉴스를 가져올 수 없습니다' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const results = {};
    for (const cat of Object.keys(CATEGORIES)) {
      results[cat] = await getNews(cat);
    }
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('News API error:', err.message);
    res.status(500).json({ success: false, error: '뉴스를 가져올 수 없습니다' });
  }
});

module.exports = router;
