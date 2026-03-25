const express = require('express');
const { getWeather } = require('../services/weatherService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const location = req.query.location || 'goyang';
    const weather = await getWeather(location);
    res.json({ success: true, data: weather });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ success: false, error: '날씨 정보를 가져올 수 없습니다' });
  }
});

module.exports = router;
