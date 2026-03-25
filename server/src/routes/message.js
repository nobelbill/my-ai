const express = require('express');
const { generateMessage } = require('../services/messageService');
const { getWeather } = require('../services/weatherService');
const { getTimeSlot } = require('../utils/timeSlot');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const hour = new Date().getHours();
    const slot = req.query.slot || getTimeSlot(hour);
    const weather = await getWeather().catch(() => null);
    const message = await generateMessage(slot, weather);
    res.json({ success: true, data: message, slot });
  } catch (err) {
    console.error('Message error:', err.message);
    res.status(500).json({ success: false, error: '메시지를 생성할 수 없습니다' });
  }
});

module.exports = router;
