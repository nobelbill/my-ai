const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { getTimeSlot, getGreeting } = require('./utils/timeSlot');

const app = express();

app.use(cors());
app.use(express.json());

// Production: serve client build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 시간대 정보
app.get('/api/timeslot', (req, res) => {
  const hour = new Date().getHours();
  const slot = getTimeSlot(hour);
  res.json({ slot, greeting: getGreeting(slot), hour });
});

// Routes
const weatherRouter = require('./routes/weather');
const busRouter = require('./routes/bus');
const newsRouter = require('./routes/news');
const messageRouter = require('./routes/message');
const settingsRouter = require('./routes/settings');
const stockRouter = require('./routes/stock');

app.use('/api/weather', weatherRouter);
app.use('/api/bus', busRouter);
app.use('/api/news', newsRouter);
app.use('/api/message', messageRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stock', stockRouter);

// 통합 대시보드 데이터
app.get('/api/dashboard', async (req, res) => {
  const hour = new Date().getHours();
  const slot = getTimeSlot(hour);
  const greeting = getGreeting(slot);
  const { lat, lon } = req.query;

  const result = { slot, greeting, hour, cards: {} };

  try {
    const { getWeather } = require('./services/weatherService');
    result.cards.weather = await getWeather('goyang', lat ? parseFloat(lat) : null, lon ? parseFloat(lon) : null).catch(() => null);
  } catch (e) {}

  try {
    const { getMessage } = require('./services/messageService');
    result.cards.message = getMessage(slot);
  } catch (e) {}

  // 관심 주식 (항상 표시)
  try {
    const { getStocks } = require('./services/stockService');
    const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/settings.json'), 'utf-8'));
    const symbols = settings.watchStocks || ['두산에너빌리티', '루시드', 'KORU', '3S', '로켓랩', 'ASTS'];
    result.cards.stocks = await getStocks(symbols).catch(() => null);
  } catch (e) {}

  // 버스 도착정보 (서울버스 API 통합)
  if (slot === 'morning') {
    try {
      const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/settings.json'), 'utf-8'));
      if (settings.commuteStation?.stationId) {
        const { getBusArrival } = require('./services/busService');
        result.cards.bus = await getBusArrival(settings.commuteStation.stationId, settings.commuteStation.routeNames).catch(() => null);
        result.cards.busStation = settings.commuteStation.stationName;
      }
    } catch (e) {}
  }

  if (slot === 'afternoon' || slot === 'late_morning') {
    try {
      const { getNews } = require('./services/newsService');
      result.cards.news = {};
      for (const cat of ['it', 'economy', 'politics']) {
        result.cards.news[cat] = await getNews(cat, 3).catch(() => []);
      }
    } catch (e) {}
  }

  if (slot === 'evening') {
    try {
      const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/settings.json'), 'utf-8'));
      if (settings.homeStation?.stationId) {
        const { getBusArrival } = require('./services/busService');
        result.cards.bus = await getBusArrival(settings.homeStation.stationId, settings.homeStation.routeNames).catch(() => null);
        result.cards.busStation = settings.homeStation.stationName;
      }
    } catch (e) {}
  }

  res.json({ success: true, data: result });
});

// Production: SPA fallback
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    }
  });
}

app.listen(config.port, () => {
  console.log(`My AI server running on port ${config.port}`);
});
