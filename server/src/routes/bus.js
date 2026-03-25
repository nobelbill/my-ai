const express = require('express');
const { getBusArrival } = require('../services/busService');
const router = express.Router();

// 통합 버스 도착정보 (서울버스 API)
router.get('/arrival', async (req, res) => {
  try {
    const { arsId, routes } = req.query;
    const routeFilter = routes ? routes.split(',') : [];
    const arrivals = await getBusArrival(arsId, routeFilter);
    res.json({ success: true, data: arrivals });
  } catch (err) {
    console.error('Bus API error:', err.message);
    res.status(500).json({ success: false, error: '버스 정보를 가져올 수 없습니다' });
  }
});

module.exports = router;
