const express = require('express');
const { getWeather } = require('../services/weatherService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    const weather = await getWeather(location || 'goyang', lat ? parseFloat(lat) : null, lon ? parseFloat(lon) : null);
    res.json({ success: true, data: weather });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ success: false, error: '날씨 정보를 가져올 수 없습니다' });
  }
});

module.exports = router;
