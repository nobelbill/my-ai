const express = require('express');
const { getStocks } = require('../services/stockService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
    const stocks = await getStocks(symbols);
    res.json({ success: true, data: stocks });
  } catch (err) {
    console.error('Stock API error:', err.message);
    res.status(500).json({ success: false, error: '주식 정보를 가져올 수 없습니다' });
  }
});

module.exports = router;
