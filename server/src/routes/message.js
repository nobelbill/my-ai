const express = require('express');
const { getMessage } = require('../services/messageService');
const { getTimeSlot } = require('../utils/timeSlot');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const hour = new Date().getHours();
    const slot = req.query.slot || getTimeSlot(hour);
    const message = getMessage(slot);
    res.json({ success: true, data: message, slot });
  } catch (err) {
    console.error('Message error:', err.message);
    res.status(500).json({ success: false, error: '메시지를 가져올 수 없습니다' });
  }
});

module.exports = router;
