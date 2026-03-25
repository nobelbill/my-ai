const express = require('express');
const { getGyeonggiBusArrival, getSeoulBusArrival } = require('../services/busService');
const router = express.Router();

router.get('/commute', async (req, res) => {
  try {
    const { stationId } = req.query;
    const arrivals = await getGyeonggiBusArrival(stationId);
    res.json({ success: true, data: arrivals });
  } catch (err) {
    console.error('Bus API error:', err.message);
    res.status(500).json({ success: false, error: '버스 정보를 가져올 수 없습니다' });
  }
});

router.get('/home', async (req, res) => {
  try {
    const { stationId } = req.query;
    const arrivals = await getSeoulBusArrival(stationId);
    res.json({ success: true, data: arrivals });
  } catch (err) {
    console.error('Bus API error:', err.message);
    res.status(500).json({ success: false, error: '버스 정보를 가져올 수 없습니다' });
  }
});

module.exports = router;
