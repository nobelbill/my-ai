# My AI - 시간대별 생활정보 대시보드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시간대에 따라 출퇴근 버스정보, 날씨, 뉴스, AI 생성 명언/메시지를 카드 UI로 보여주는 Electron + 모바일 웹 하이브리드 대시보드 앱

**Architecture:** React SPA가 프론트엔드를 담당하며, Node.js/Express 백엔드(OCI 서버)가 외부 API 프록시 및 AI 메시지 생성을 처리. Electron이 데스크톱 래퍼 역할. 시간대(아침/오후/저녁)에 따라 테마와 카드 구성이 자동 전환됨.

**Tech Stack:** React 18, Vite, Tailwind CSS 3, Framer Motion, Lucide Icons, Express.js, node-cron, Electron, web-push

---

## File Structure

```
my-ai/
├── package.json                    # 루트 (워크스페이스 관리)
├── .env.example                    # 환경변수 템플릿
├── .gitignore
│
├── server/                         # 백엔드 (OCI 배포)
│   ├── package.json
│   ├── src/
│   │   ├── index.js                # Express 서버 진입점
│   │   ├── config.js               # 환경변수/설정 로드
│   │   ├── routes/
│   │   │   ├── bus.js              # 버스 도착정보 API
│   │   │   ├── weather.js          # 날씨 API
│   │   │   ├── news.js             # 뉴스 API
│   │   │   ├── message.js          # AI 명언/메시지 API
│   │   │   └── settings.js         # 사용자 설정 API
│   │   ├── services/
│   │   │   ├── busService.js       # 경기/서울 버스 API 호출
│   │   │   ├── weatherService.js   # 기상청 API 호출
│   │   │   ├── newsService.js      # 네이버 뉴스 API 호출
│   │   │   └── messageService.js   # Claude API 호출
│   │   ├── utils/
│   │   │   ├── timeSlot.js         # 시간대 판별 유틸
│   │   │   └── cache.js            # 간단한 메모리 캐시
│   │   └── data/
│   │       └── settings.json       # 사용자 설정 파일
│   └── tests/
│       ├── timeSlot.test.js
│       ├── busService.test.js
│       ├── weatherService.test.js
│       ├── newsService.test.js
│       └── messageService.test.js
│
├── client/                         # 프론트엔드 (React)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   │   └── icons/                  # PWA 아이콘
│   └── src/
│       ├── main.jsx                # React 진입점
│       ├── App.jsx                 # 루트 컴포넌트 (시간대 라우팅)
│       ├── hooks/
│       │   ├── useTimeSlot.js      # 현재 시간대 감지 훅
│       │   ├── useApi.js           # API 호출 훅
│       │   └── useTheme.js         # 시간대별 테마 훅
│       ├── components/
│       │   ├── Layout.jsx          # 전체 레이아웃 (그리드)
│       │   ├── Card.jsx            # 기본 카드 컴포넌트
│       │   ├── BusCard.jsx         # 버스 도착정보 카드
│       │   ├── WeatherCard.jsx     # 날씨 카드
│       │   ├── NewsCard.jsx        # 뉴스 카드
│       │   ├── MessageCard.jsx     # 명언/메시지 카드
│       │   ├── ClockHeader.jsx     # 시계 + 인사말 헤더
│       │   └── SettingsPanel.jsx   # 설정 패널
│       ├── themes/
│       │   └── timeThemes.js       # 시간대별 테마 정의
│       └── utils/
│           └── api.js              # API 클라이언트
│
└── electron/                       # Electron 래퍼
    ├── package.json
    ├── main.js                     # Electron 메인 프로세스
    ├── preload.js                  # 프리로드 스크립트
    └── notifier.js                 # 알림 스케줄러
```

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: `package.json` (루트)
- Create: `.gitignore`
- Create: `.env.example`
- Create: `server/package.json`
- Create: `client/package.json`

- [ ] **Step 1: 루트 package.json 생성 (npm workspaces)**

```json
{
  "name": "my-ai",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["server", "client", "electron"],
  "scripts": {
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "test": "npm run test --workspace=server",
    "build": "npm run build --workspace=client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: .gitignore 생성**

```
node_modules/
dist/
.env
.DS_Store
*.log
```

- [ ] **Step 3: .env.example 생성**

```env
# Server
PORT=5000
NODE_ENV=development

# 공공데이터포털 (data.go.kr)
BUS_API_KEY=your_bus_api_key

# 카카오
KAKAO_APP_KEY=your_kakao_app_key

# 기상청
WEATHER_API_KEY=your_weather_api_key

# 네이버
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Claude
ANTHROPIC_API_KEY=your_anthropic_api_key
```

- [ ] **Step 4: server/package.json 생성**

```json
{
  "name": "my-ai-server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test tests/**/*.test.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "fast-xml-parser": "^4.3.4",
    "node-cron": "^3.0.3",
    "axios": "^1.6.7",
    "@anthropic-ai/sdk": "^0.39.0",
    "web-push": "^3.6.7"
  }
}
```

- [ ] **Step 5: client/package.json 생성 (Vite + React)**

```json
{
  "name": "my-ai-client",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "axios": "^1.6.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
```

- [ ] **Step 6: npm install 실행**

Run: `npm install`
Expected: 모든 워크스페이스 의존성 설치 성공

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: 프로젝트 초기 설정 (npm workspaces, server, client)"
```

---

## Task 2: 서버 - 기본 Express 셋업 + 시간대 유틸

**Files:**
- Create: `server/src/index.js`
- Create: `server/src/config.js`
- Create: `server/src/utils/timeSlot.js`
- Create: `server/tests/timeSlot.test.js`

- [ ] **Step 1: timeSlot 테스트 작성**

```js
// server/tests/timeSlot.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getTimeSlot, getGreeting } = require('../src/utils/timeSlot');

describe('getTimeSlot', () => {
  it('returns morning for 6-9', () => {
    assert.strictEqual(getTimeSlot(6), 'morning');
    assert.strictEqual(getTimeSlot(8), 'morning');
  });
  it('returns late_morning for 9-11', () => {
    assert.strictEqual(getTimeSlot(9), 'late_morning');
    assert.strictEqual(getTimeSlot(11), 'late_morning');
  });
  it('returns afternoon for 12-17', () => {
    assert.strictEqual(getTimeSlot(12), 'afternoon');
    assert.strictEqual(getTimeSlot(16), 'afternoon');
  });
  it('returns evening for 17-21', () => {
    assert.strictEqual(getTimeSlot(17), 'evening');
    assert.strictEqual(getTimeSlot(20), 'evening');
  });
  it('returns idle for other hours', () => {
    assert.strictEqual(getTimeSlot(3), 'idle');
    assert.strictEqual(getTimeSlot(23), 'idle');
  });
});

describe('getGreeting', () => {
  it('returns 좋은 아침이에요 for morning', () => {
    assert.ok(getGreeting('morning').includes('아침'));
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd server && node --test tests/timeSlot.test.js`
Expected: FAIL (module not found)

- [ ] **Step 3: timeSlot.js 구현**

```js
// server/src/utils/timeSlot.js
function getTimeSlot(hour) {
  if (hour >= 6 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'late_morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'idle';
}

function getGreeting(slot) {
  const greetings = {
    morning: '좋은 아침이에요! ☀️',
    late_morning: '오전도 화이팅! 💪',
    afternoon: '좋은 오후에요! 🌤️',
    evening: '수고한 하루, 편안한 저녁 되세요 🌙',
    idle: '편안한 시간 보내세요 ✨',
  };
  return greetings[slot] || greetings.idle;
}

module.exports = { getTimeSlot, getGreeting };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd server && node --test tests/timeSlot.test.js`
Expected: PASS

- [ ] **Step 5: config.js 생성**

```js
// server/src/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  busApiKey: process.env.BUS_API_KEY,
  kakaoAppKey: process.env.KAKAO_APP_KEY,
  weatherApiKey: process.env.WEATHER_API_KEY,
  naverClientId: process.env.NAVER_CLIENT_ID,
  naverClientSecret: process.env.NAVER_CLIENT_SECRET,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
```

- [ ] **Step 6: Express 서버 진입점 생성**

```js
// server/src/index.js
const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 시간대 정보
app.get('/api/timeslot', (req, res) => {
  const { getTimeSlot, getGreeting } = require('./utils/timeSlot');
  const hour = new Date().getHours();
  const slot = getTimeSlot(hour);
  res.json({ slot, greeting: getGreeting(slot), hour });
});

app.listen(config.port, () => {
  console.log(`My AI server running on port ${config.port}`);
});
```

- [ ] **Step 7: 서버 실행 테스트**

Run: `cd server && node src/index.js &` then `curl http://localhost:5000/api/health`
Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 8: 커밋**

```bash
git add server/src server/tests
git commit -m "feat: Express 서버 기본 셋업 + 시간대 유틸"
```

---

## Task 3: 서버 - 날씨 서비스

**Files:**
- Create: `server/src/services/weatherService.js`
- Create: `server/src/routes/weather.js`
- Create: `server/src/utils/cache.js`
- Create: `server/tests/weatherService.test.js`

- [ ] **Step 1: 캐시 유틸 작성**

```js
// server/src/utils/cache.js
class SimpleCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.store = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, time: Date.now() });
  }
}

module.exports = { SimpleCache };
```

- [ ] **Step 2: weatherService 테스트 작성**

```js
// server/tests/weatherService.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseWeatherResponse, getNxNy } = require('../src/services/weatherService');

describe('getNxNy', () => {
  it('returns grid coordinates for 고양시', () => {
    const coords = getNxNy('goyang');
    assert.ok(coords.nx);
    assert.ok(coords.ny);
  });
});

describe('parseWeatherResponse', () => {
  it('parses 기상청 API response correctly', () => {
    const mockResponse = {
      response: {
        body: {
          items: {
            item: [
              { category: 'TMP', fcstValue: '15' },
              { category: 'SKY', fcstValue: '1' },
              { category: 'PTY', fcstValue: '0' },
              { category: 'POP', fcstValue: '10' },
            ]
          }
        }
      }
    };
    const result = parseWeatherResponse(mockResponse);
    assert.strictEqual(result.temperature, '15');
    assert.strictEqual(result.sky, '맑음');
    assert.strictEqual(result.precipitation, '없음');
    assert.strictEqual(result.rainProbability, '10');
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `cd server && node --test tests/weatherService.test.js`
Expected: FAIL

- [ ] **Step 4: weatherService.js 구현**

```js
// server/src/services/weatherService.js
const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(30 * 60 * 1000); // 30분 캐시

// 기상청 격자 좌표 (고양시, 강남구)
const GRID_COORDS = {
  goyang: { nx: 57, ny: 128 },
  gangnam: { nx: 61, ny: 126 },
};

function getNxNy(location) {
  return GRID_COORDS[location] || GRID_COORDS.goyang;
}

const SKY_MAP = { '1': '맑음', '3': '구름많음', '4': '흐림' };
const PTY_MAP = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };

function parseWeatherResponse(data) {
  const items = data.response?.body?.items?.item || [];
  const map = {};
  items.forEach(item => { map[item.category] = item.fcstValue; });

  return {
    temperature: map.TMP || map.T1H || '-',
    sky: SKY_MAP[map.SKY] || '알 수 없음',
    precipitation: PTY_MAP[map.PTY] || '알 수 없음',
    rainProbability: map.POP || '0',
    humidity: map.REH || '-',
    windSpeed: map.WSD || '-',
  };
}

async function getWeather(location = 'goyang') {
  const cacheKey = `weather_${location}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { nx, ny } = getNxNy(location);
  const now = new Date();
  const baseDate = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

  // 기상청 단기예보 base_time: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  const hours = now.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseTime = '0200';
  for (const bt of baseTimes) {
    if (hours >= bt + 1) baseTime = String(bt).padStart(2, '0') + '00';
  }

  const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
  const { data } = await axios.get(url, {
    params: {
      serviceKey: config.weatherApiKey,
      numOfRows: 50,
      pageNo: 1,
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx, ny,
    },
  });

  const result = parseWeatherResponse(data);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getWeather, parseWeatherResponse, getNxNy };
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd server && node --test tests/weatherService.test.js`
Expected: PASS

- [ ] **Step 6: weather 라우트 생성**

```js
// server/src/routes/weather.js
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
```

- [ ] **Step 7: index.js에 라우트 연결**

```js
// server/src/index.js 에 추가
const weatherRouter = require('./routes/weather');
app.use('/api/weather', weatherRouter);
```

- [ ] **Step 8: 커밋**

```bash
git add server/src server/tests
git commit -m "feat: 기상청 날씨 서비스 + 캐싱"
```

---

## Task 4: 서버 - 버스 도착정보 서비스

**Files:**
- Create: `server/src/services/busService.js`
- Create: `server/src/routes/bus.js`
- Create: `server/tests/busService.test.js`

- [ ] **Step 1: busService 테스트 작성**

```js
// server/tests/busService.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseBusArrival, formatArrivalTime } = require('../src/services/busService');

describe('formatArrivalTime', () => {
  it('converts seconds to minutes', () => {
    assert.strictEqual(formatArrivalTime(180), '3분');
    assert.strictEqual(formatArrivalTime(60), '1분');
    assert.strictEqual(formatArrivalTime(30), '곧 도착');
  });
});

describe('parseBusArrival', () => {
  it('parses 경기버스 API response', () => {
    const mockItems = [
      { routeId: '1234', routeName: '9700', predictTime1: '5', predictTime2: '15', stationId: '5678' }
    ];
    const result = parseBusArrival(mockItems);
    assert.strictEqual(result[0].routeName, '9700');
    assert.strictEqual(result[0].firstArrival, '5분');
    assert.strictEqual(result[0].secondArrival, '15분');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd server && node --test tests/busService.test.js`
Expected: FAIL

- [ ] **Step 3: busService.js 구현**

```js
// server/src/services/busService.js
const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(60 * 1000); // 1분 캐시 (버스는 실시간)

function formatArrivalTime(seconds) {
  if (typeof seconds === 'string') seconds = parseInt(seconds, 10);
  if (seconds <= 0 || isNaN(seconds)) return '정보없음';
  if (seconds < 60) return '곧 도착';
  return `${Math.floor(seconds / 60)}분`;
}

// predictTime은 분 단위로 오는 경우도 있음
function formatPredictTime(minutes) {
  if (!minutes || minutes === '0') return '정보없음';
  return `${minutes}분`;
}

function parseBusArrival(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    routeId: item.routeId,
    routeName: item.routeName || item.rtNm || '',
    firstArrival: formatPredictTime(item.predictTime1 || item.arrmsg1),
    secondArrival: formatPredictTime(item.predictTime2 || item.arrmsg2),
    stationId: item.stationId || item.stId || '',
  }));
}

// 경기버스 도착정보 (출근: 고양시)
async function getGyeonggiBusArrival(stationId) {
  const cacheKey = `gg_bus_${stationId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = 'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList';
  const { data } = await axios.get(url, {
    params: { serviceKey: config.busApiKey, stationId },
  });

  const items = data?.response?.msgBody?.busArrivalList;
  const result = parseBusArrival(Array.isArray(items) ? items : items ? [items] : []);
  cache.set(cacheKey, result);
  return result;
}

// 서울버스 도착정보 (퇴근: 강남)
async function getSeoulBusArrival(stId) {
  const cacheKey = `seoul_bus_${stId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid';
  const { data } = await axios.get(url, {
    params: { serviceKey: config.busApiKey, arsId: stId },
  });

  const { XMLParser } = require('fast-xml-parser');
  const parser = new XMLParser();
  const parsed = typeof data === 'string' ? parser.parse(data) : data;
  const items = parsed?.ServiceResult?.msgBody?.itemList;
  const result = parseBusArrival(Array.isArray(items) ? items : items ? [items] : []);
  cache.set(cacheKey, result);
  return result;
}

module.exports = {
  getGyeonggiBusArrival,
  getSeoulBusArrival,
  parseBusArrival,
  formatArrivalTime,
  formatPredictTime,
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd server && node --test tests/busService.test.js`
Expected: PASS

- [ ] **Step 5: bus 라우트 생성**

```js
// server/src/routes/bus.js
const express = require('express');
const { getGyeonggiBusArrival, getSeoulBusArrival } = require('../services/busService');
const router = express.Router();

// 출근 버스 (경기 고양시)
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

// 퇴근 버스 (서울 강남)
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
```

- [ ] **Step 6: index.js에 라우트 연결**

```js
const busRouter = require('./routes/bus');
app.use('/api/bus', busRouter);
```

- [ ] **Step 7: 커밋**

```bash
git add server/src server/tests
git commit -m "feat: 경기/서울 버스 도착정보 서비스"
```

---

## Task 5: 서버 - 뉴스 서비스

**Files:**
- Create: `server/src/services/newsService.js`
- Create: `server/src/routes/news.js`
- Create: `server/tests/newsService.test.js`

- [ ] **Step 1: newsService 테스트 작성**

```js
// server/tests/newsService.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseNewsResponse, CATEGORIES } = require('../src/services/newsService');

describe('CATEGORIES', () => {
  it('has IT, economy, politics', () => {
    assert.ok(CATEGORIES.it);
    assert.ok(CATEGORIES.economy);
    assert.ok(CATEGORIES.politics);
  });
});

describe('parseNewsResponse', () => {
  it('strips HTML tags from title and description', () => {
    const mockData = {
      items: [
        {
          title: '<b>테스트</b> 뉴스 제목',
          description: '뉴스 <b>설명</b>입니다',
          link: 'https://news.example.com/1',
          pubDate: 'Tue, 25 Mar 2026 09:00:00 +0900',
        }
      ]
    };
    const result = parseNewsResponse(mockData);
    assert.strictEqual(result[0].title, '테스트 뉴스 제목');
    assert.strictEqual(result[0].description, '뉴스 설명입니다');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd server && node --test tests/newsService.test.js`
Expected: FAIL

- [ ] **Step 3: newsService.js 구현**

```js
// server/src/services/newsService.js
const axios = require('axios');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(15 * 60 * 1000); // 15분 캐시

const CATEGORIES = {
  it: 'IT 기술',
  economy: '경제 금융',
  politics: '정치 사회',
};

function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '');
}

function parseNewsResponse(data) {
  const items = data?.items || [];
  return items.map(item => ({
    title: stripHtml(item.title),
    description: stripHtml(item.description),
    link: item.originallink || item.link,
    pubDate: item.pubDate,
  }));
}

async function getNews(category = 'it', count = 5) {
  const cacheKey = `news_${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const query = CATEGORIES[category] || CATEGORIES.it;
  const { data } = await axios.get('https://openapi.naver.com/v1/search/news.json', {
    params: { query, display: count, sort: 'date' },
    headers: {
      'X-Naver-Client-Id': config.naverClientId,
      'X-Naver-Client-Secret': config.naverClientSecret,
    },
  });

  const result = parseNewsResponse(data);
  cache.set(cacheKey, result);
  return result;
}

module.exports = { getNews, parseNewsResponse, CATEGORIES };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd server && node --test tests/newsService.test.js`
Expected: PASS

- [ ] **Step 5: news 라우트 생성**

```js
// server/src/routes/news.js
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
```

- [ ] **Step 6: index.js에 라우트 연결**

```js
const newsRouter = require('./routes/news');
app.use('/api/news', newsRouter);
```

- [ ] **Step 7: 커밋**

```bash
git add server/src server/tests
git commit -m "feat: 네이버 뉴스 서비스 (IT/경제/정치)"
```

---

## Task 6: 서버 - AI 메시지 서비스 (Claude API)

**Files:**
- Create: `server/src/services/messageService.js`
- Create: `server/src/routes/message.js`
- Create: `server/tests/messageService.test.js`

- [ ] **Step 1: messageService 테스트 작성**

```js
// server/tests/messageService.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { buildPrompt } = require('../src/services/messageService');

describe('buildPrompt', () => {
  it('creates morning prompt with weather context', () => {
    const prompt = buildPrompt('morning', { temperature: '15', sky: '맑음' });
    assert.ok(prompt.includes('아침'));
    assert.ok(prompt.includes('15'));
    assert.ok(prompt.includes('맑음'));
  });

  it('creates evening prompt for daily wrap-up', () => {
    const prompt = buildPrompt('evening', { temperature: '10', sky: '흐림' });
    assert.ok(prompt.includes('저녁') || prompt.includes('하루'));
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd server && node --test tests/messageService.test.js`
Expected: FAIL

- [ ] **Step 3: messageService.js 구현**

```js
// server/src/services/messageService.js
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(60 * 60 * 1000); // 1시간 캐시

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: config.anthropicApiKey });
  return client;
}

function buildPrompt(slot, weather) {
  const weatherInfo = weather
    ? `현재 날씨: 기온 ${weather.temperature}°C, ${weather.sky}`
    : '';

  const slotInstructions = {
    morning: `아침 시간대입니다. ${weatherInfo}
오늘 하루를 기분 좋게 시작할 수 있는 따뜻한 명언 하나와 응원 메시지를 한국어로 작성해주세요.
형식: { "quote": "명언 내용", "author": "저자", "message": "응원 메시지" }`,

    afternoon: `오후 시간대입니다. ${weatherInfo}
오후를 활기차게 보낼 수 있는 짧은 응원 메시지를 한국어로 작성해주세요.
형식: { "message": "응원 메시지" }`,

    evening: `저녁 시간대입니다. ${weatherInfo}
하루를 마무리하며 내일을 기대할 수 있는 따뜻한 메시지와 명언을 한국어로 작성해주세요.
형식: { "quote": "명언 내용", "author": "저자", "message": "마무리 메시지" }`,

    idle: `늦은 시간입니다. 편안한 휴식을 위한 짧은 메시지를 한국어로 작성해주세요.
형식: { "message": "휴식 메시지" }`,
  };

  return slotInstructions[slot] || slotInstructions.idle;
}

async function generateMessage(slot, weather) {
  const cacheKey = `msg_${slot}_${new Date().toISOString().slice(0, 10)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const prompt = buildPrompt(slot, weather);

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: text };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Claude API error:', err.message);
    return { message: '오늘도 좋은 하루 되세요! ✨', quote: '', author: '' };
  }
}

module.exports = { generateMessage, buildPrompt };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd server && node --test tests/messageService.test.js`
Expected: PASS

- [ ] **Step 5: message 라우트 생성**

```js
// server/src/routes/message.js
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
```

- [ ] **Step 6: index.js에 라우트 연결**

```js
const messageRouter = require('./routes/message');
app.use('/api/message', messageRouter);
```

- [ ] **Step 7: 커밋**

```bash
git add server/src server/tests
git commit -m "feat: Claude API 기반 AI 명언/메시지 서비스"
```

---

## Task 7: 서버 - 설정 API + 통합 대시보드 엔드포인트

**Files:**
- Create: `server/src/routes/settings.js`
- Create: `server/src/data/settings.json`
- Modify: `server/src/index.js`

- [ ] **Step 1: 기본 설정 파일 생성**

```json
{
  "commuteStation": {
    "stationId": "",
    "stationName": "고양시 정류장",
    "routeNames": []
  },
  "homeStation": {
    "stationId": "",
    "stationName": "강남 정류장",
    "routeNames": []
  },
  "notifications": {
    "morning": "07:00",
    "evening": "17:30"
  },
  "newsCategories": ["it", "economy", "politics"]
}
```

- [ ] **Step 2: settings 라우트 생성**

```js
// server/src/routes/settings.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SETTINGS_PATH = path.join(__dirname, '../data/settings.json');

function readSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
}

function writeSettings(data) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  const settings = readSettings();
  res.json({ success: true, data: settings });
});

router.put('/', (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: '설정 저장 실패' });
  }
});

module.exports = router;
```

- [ ] **Step 3: 통합 대시보드 엔드포인트 추가 (index.js)**

시간대에 따라 필요한 데이터만 모아서 한번에 내려주는 엔드포인트:

```js
// server/src/index.js 에 추가
const { getTimeSlot, getGreeting } = require('./utils/timeSlot');
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);
// 주의: weather, bus, news, message 라우트는 Task 3-6에서 이미 등록됨

// 통합 대시보드 데이터
app.get('/api/dashboard', async (req, res) => {
  const hour = new Date().getHours();
  const slot = getTimeSlot(hour);
  const greeting = getGreeting(slot);

  const result = { slot, greeting, hour, cards: {} };

  try {
    const { getWeather } = require('./services/weatherService');
    result.cards.weather = await getWeather().catch(() => null);
  } catch (e) {}

  try {
    const { generateMessage } = require('./services/messageService');
    result.cards.message = await generateMessage(slot, result.cards.weather).catch(() => null);
  } catch (e) {}

  if (slot === 'morning') {
    try {
      const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'data/settings.json'), 'utf-8'));
      if (settings.commuteStation?.stationId) {
        const { getGyeonggiBusArrival } = require('./services/busService');
        result.cards.bus = await getGyeonggiBusArrival(settings.commuteStation.stationId).catch(() => null);
      }
    } catch (e) {}
  }

  if (slot === 'afternoon') {
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
      const settings = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'data/settings.json'), 'utf-8'));
      if (settings.homeStation?.stationId) {
        const { getSeoulBusArrival } = require('./services/busService');
        result.cards.bus = await getSeoulBusArrival(settings.homeStation.stationId).catch(() => null);
      }
    } catch (e) {}
  }

  res.json({ success: true, data: result });
});
```

- [ ] **Step 4: 커밋**

```bash
git add server/src
git commit -m "feat: 설정 API + 통합 대시보드 엔드포인트"
```

---

## Task 8: 클라이언트 - Vite + React + Tailwind 초기 셋업

**Files:**
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`

- [ ] **Step 1: Vite 설정**

```js
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

- [ ] **Step 2: Tailwind 설정**

```js
// client/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

```js
// client/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My AI - 나만의 생활 대시보드</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: main.jsx + App.jsx 기본 구조**

```jsx
// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```css
/* client/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Pretendard', system-ui, sans-serif;
}
```

```jsx
// client/src/App.jsx
import { useState, useEffect } from 'react';
import { useTimeSlot } from './hooks/useTimeSlot';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import ClockHeader from './components/ClockHeader';

export default function App() {
  const { slot, greeting, hour } = useTimeSlot();
  const theme = useTheme(slot);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ClockHeader greeting={greeting} slot={slot} theme={theme} />
        <Layout slot={slot} theme={theme} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add client/
git commit -m "feat: 클라이언트 Vite + React + Tailwind 초기 셋업"
```

---

## Task 9: 클라이언트 - 시간대별 테마 + 커스텀 훅

**Files:**
- Create: `client/src/themes/timeThemes.js`
- Create: `client/src/hooks/useTimeSlot.js`
- Create: `client/src/hooks/useTheme.js`
- Create: `client/src/hooks/useApi.js`
- Create: `client/src/utils/api.js`

- [ ] **Step 1: 시간대별 테마 정의**

```js
// client/src/themes/timeThemes.js
export const themes = {
  morning: {
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100',
    cardBg: 'bg-white/70 backdrop-blur-md',
    text: 'text-amber-900',
    subtext: 'text-amber-700',
    accent: 'text-orange-500',
    border: 'border-amber-200/50',
    icon: 'text-orange-400',
    badge: 'bg-amber-100 text-amber-800',
  },
  late_morning: {
    bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50',
    cardBg: 'bg-white/70 backdrop-blur-md',
    text: 'text-sky-900',
    subtext: 'text-sky-700',
    accent: 'text-blue-500',
    border: 'border-sky-200/50',
    icon: 'text-blue-400',
    badge: 'bg-sky-100 text-sky-800',
  },
  afternoon: {
    bg: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    cardBg: 'bg-white/80 backdrop-blur-md',
    text: 'text-slate-900',
    subtext: 'text-slate-600',
    accent: 'text-blue-600',
    border: 'border-slate-200/50',
    icon: 'text-indigo-400',
    badge: 'bg-blue-100 text-blue-800',
  },
  evening: {
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950',
    cardBg: 'bg-white/10 backdrop-blur-lg',
    text: 'text-slate-100',
    subtext: 'text-slate-300',
    accent: 'text-purple-400',
    border: 'border-white/10',
    icon: 'text-purple-300',
    badge: 'bg-purple-900/50 text-purple-200',
  },
  idle: {
    bg: 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900',
    cardBg: 'bg-white/5 backdrop-blur-lg',
    text: 'text-gray-200',
    subtext: 'text-gray-400',
    accent: 'text-emerald-400',
    border: 'border-white/5',
    icon: 'text-emerald-300',
    badge: 'bg-gray-800 text-gray-300',
  },
};
```

- [ ] **Step 2: 커스텀 훅 작성**

```js
// client/src/hooks/useTimeSlot.js
import { useState, useEffect } from 'react';

function getSlot(hour) {
  if (hour >= 6 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'late_morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'idle';
}

const GREETINGS = {
  morning: '좋은 아침이에요! ☀️',
  late_morning: '오전도 화이팅! 💪',
  afternoon: '좋은 오후에요! 🌤️',
  evening: '수고한 하루, 편안한 저녁 되세요 🌙',
  idle: '편안한 시간 보내세요 ✨',
};

export function useTimeSlot() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const slot = getSlot(hour);

  return { slot, greeting: GREETINGS[slot], hour, now };
}
```

```js
// client/src/hooks/useTheme.js
import { themes } from '../themes/timeThemes';

export function useTheme(slot) {
  return themes[slot] || themes.idle;
}
```

```js
// client/src/utils/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

export async function fetchDashboard() {
  const { data } = await api.get('/dashboard');
  return data.data;
}

export async function fetchWeather(location) {
  const { data } = await api.get('/weather', { params: { location } });
  return data.data;
}

export async function fetchBus(type, stationId) {
  const endpoint = type === 'commute' ? '/bus/commute' : '/bus/home';
  const { data } = await api.get(endpoint, { params: { stationId } });
  return data.data;
}

export async function fetchNews(category) {
  const { data } = await api.get('/news', { params: { category } });
  return data.data;
}

export async function fetchMessage() {
  const { data } = await api.get('/message');
  return data.data;
}

export async function fetchSettings() {
  const { data } = await api.get('/settings');
  return data.data;
}

export async function updateSettings(settings) {
  const { data } = await api.put('/settings', settings);
  return data.data;
}
```

```js
// client/src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

export function useApi(fetcher, deps = [], interval = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
    if (interval > 0) {
      const timer = setInterval(load, interval);
      return () => clearInterval(timer);
    }
  }, [load, interval]);

  return { data, loading, error, refetch: load };
}
```

- [ ] **Step 3: 커밋**

```bash
git add client/src
git commit -m "feat: 시간대별 테마 + 커스텀 훅 (useTimeSlot, useTheme, useApi)"
```

---

## Task 10: 클라이언트 - 카드 컴포넌트들

**Files:**
- Create: `client/src/components/Card.jsx`
- Create: `client/src/components/ClockHeader.jsx`
- Create: `client/src/components/BusCard.jsx`
- Create: `client/src/components/WeatherCard.jsx`
- Create: `client/src/components/NewsCard.jsx`
- Create: `client/src/components/MessageCard.jsx`
- Create: `client/src/components/Layout.jsx`

- [ ] **Step 1: 기본 Card 컴포넌트**

```jsx
// client/src/components/Card.jsx
import { motion } from 'framer-motion';

export default function Card({ children, theme, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-6 shadow-lg ${theme.cardBg} border ${theme.border} ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: ClockHeader 컴포넌트**

```jsx
// client/src/components/ClockHeader.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ClockHeader({ greeting, slot, theme }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <p className={`text-sm ${theme.subtext} mb-1`}>{dateStr}</p>
      <h1 className={`text-6xl font-bold ${theme.text} tracking-tight mb-3`}>
        {timeStr}
      </h1>
      <p className={`text-xl ${theme.subtext}`}>{greeting}</p>
    </motion.header>
  );
}
```

- [ ] **Step 3: WeatherCard 컴포넌트**

```jsx
// client/src/components/WeatherCard.jsx
import Card from './Card';
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Droplets, Wind } from 'lucide-react';

const skyIcons = {
  '맑음': Sun,
  '구름많음': Cloud,
  '흐림': Cloud,
};

const ptyIcons = {
  '비': CloudRain,
  '비/눈': CloudDrizzle,
  '눈': CloudSnow,
  '소나기': CloudRain,
};

export default function WeatherCard({ data, theme, delay = 0 }) {
  if (!data) return null;

  const SkyIcon = ptyIcons[data.precipitation] || skyIcons[data.sky] || Sun;

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme.subtext} mb-1`}>오늘 날씨</p>
          <p className={`text-4xl font-bold ${theme.text}`}>{data.temperature}°</p>
          <p className={`text-sm ${theme.subtext} mt-1`}>
            {data.sky} · 강수확률 {data.rainProbability}%
          </p>
        </div>
        <SkyIcon className={`w-16 h-16 ${theme.icon}`} strokeWidth={1.5} />
      </div>
      <div className={`flex gap-4 mt-4 pt-4 border-t ${theme.border}`}>
        <div className="flex items-center gap-1.5">
          <Droplets className={`w-4 h-4 ${theme.icon}`} />
          <span className={`text-xs ${theme.subtext}`}>습도 {data.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className={`w-4 h-4 ${theme.icon}`} />
          <span className={`text-xs ${theme.subtext}`}>풍속 {data.windSpeed}m/s</span>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: BusCard 컴포넌트**

```jsx
// client/src/components/BusCard.jsx
import { useState, useEffect } from 'react';
import Card from './Card';
import { Bus, Clock, MapPin } from 'lucide-react';

export default function BusCard({ data, stationName, type, theme, delay = 0 }) {
  if (!data || data.length === 0) return null;

  const title = type === 'commute' ? '출근 버스' : '퇴근 버스';
  const icon = type === 'commute' ? '🚌' : '🏠';

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center gap-2 mb-4">
        <Bus className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>{icon} {title}</h3>
      </div>
      {stationName && (
        <div className={`flex items-center gap-1.5 mb-3 text-xs ${theme.subtext}`}>
          <MapPin className="w-3 h-3" />
          <span>{stationName}</span>
        </div>
      )}
      <div className="space-y-3">
        {data.map((bus, i) => (
          <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl ${theme.badge}`}>
            <span className="font-bold text-sm">{bus.routeName}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-sm font-medium">{bus.firstArrival}</span>
              </div>
              <span className="text-xs opacity-60">{bus.secondArrival}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: NewsCard 컴포넌트**

```jsx
// client/src/components/NewsCard.jsx
import { useState } from 'react';
import Card from './Card';
import { Newspaper, Monitor, TrendingUp, Users } from 'lucide-react';

const catIcons = {
  it: Monitor,
  economy: TrendingUp,
  politics: Users,
};
const catLabels = {
  it: 'IT/기술',
  economy: '경제/금융',
  politics: '정치/사회',
};

export default function NewsCard({ data, theme, delay = 0 }) {
  const [activeTab, setActiveTab] = useState('it');

  if (!data) return null;

  const categories = Object.keys(data);
  const articles = data[activeTab] || [];

  return (
    <Card theme={theme} delay={delay} className="col-span-full lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>📰 주요 뉴스</h3>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {categories.map(cat => {
          const Icon = catIcons[cat] || Newspaper;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeTab === cat ? theme.badge + ' shadow-sm' : theme.subtext + ' hover:opacity-70'}`}
            >
              <Icon className="w-3 h-3" />
              {catLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* 기사 목록 */}
      <div className="space-y-3">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-3 rounded-xl hover:scale-[1.01] transition-transform ${theme.cardBg} border ${theme.border}`}
          >
            <p className={`font-medium text-sm ${theme.text} line-clamp-1`}>{article.title}</p>
            <p className={`text-xs ${theme.subtext} mt-1 line-clamp-2`}>{article.description}</p>
          </a>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 6: MessageCard 컴포넌트**

```jsx
// client/src/components/MessageCard.jsx
import Card from './Card';
import { Sparkles, Quote } from 'lucide-react';

export default function MessageCard({ data, slot, theme, delay = 0 }) {
  if (!data) return null;

  const isQuoteSlot = slot === 'morning' || slot === 'evening';

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>
          {slot === 'morning' ? '✨ 오늘의 명언' : slot === 'evening' ? '🌙 하루 마감' : '💬 한마디'}
        </h3>
      </div>

      {isQuoteSlot && data.quote && (
        <div className={`mb-4 pl-4 border-l-2 ${theme.border}`}>
          <p className={`text-lg italic ${theme.text} leading-relaxed`}>
            "{data.quote}"
          </p>
          {data.author && (
            <p className={`text-sm ${theme.subtext} mt-2`}>— {data.author}</p>
          )}
        </div>
      )}

      {data.message && (
        <p className={`${theme.subtext} leading-relaxed`}>{data.message}</p>
      )}
    </Card>
  );
}
```

- [ ] **Step 7: Layout 컴포넌트 (시간대별 카드 배치)**

```jsx
// client/src/components/Layout.jsx
import { useApi } from '../hooks/useApi';
import { fetchDashboard } from '../utils/api';
import WeatherCard from './WeatherCard';
import BusCard from './BusCard';
import NewsCard from './NewsCard';
import MessageCard from './MessageCard';
import { Loader2 } from 'lucide-react';

export default function Layout({ slot, theme }) {
  const { data, loading, error } = useApi(fetchDashboard, [slot], 60000);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.icon}`} />
      </div>
    );
  }

  const cards = data?.cards || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 날씨 - 항상 표시 */}
      <WeatherCard data={cards.weather} theme={theme} delay={0.1} />

      {/* 메시지/명언 - 항상 표시 */}
      <MessageCard data={cards.message} slot={slot} theme={theme} delay={0.2} />

      {/* 버스 - 아침/저녁에만 */}
      {(slot === 'morning' || slot === 'evening') && (
        <BusCard
          data={cards.bus}
          stationName={slot === 'morning' ? '고양시 정류장' : '강남 정류장'}
          type={slot === 'morning' ? 'commute' : 'home'}
          theme={theme}
          delay={0.3}
        />
      )}

      {/* 뉴스 - 오후에만 */}
      {slot === 'afternoon' && (
        <NewsCard data={cards.news} theme={theme} delay={0.3} />
      )}
    </div>
  );
}
```

- [ ] **Step 8: 커밋**

```bash
git add client/src
git commit -m "feat: 카드 컴포넌트 (Weather, Bus, News, Message, Layout)"
```

---

## Task 11: 클라이언트 - 설정 패널

**Files:**
- Create: `client/src/components/SettingsPanel.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: SettingsPanel 구현**

```jsx
// client/src/components/SettingsPanel.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, Bus, Bell } from 'lucide-react';
import { fetchSettings, updateSettings } from '../utils/api';

export default function SettingsPanel({ theme }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) fetchSettings().then(setSettings);
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-6 right-6 p-3 rounded-full ${theme.cardBg} shadow-lg border ${theme.border} hover:scale-105 transition-transform`}
      >
        <Settings className={`w-5 h-5 ${theme.icon}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 ${theme.cardBg} border ${theme.border} shadow-xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${theme.text}`}>⚙️ 설정</h2>
                <button onClick={() => setOpen(false)}>
                  <X className={`w-5 h-5 ${theme.subtext}`} />
                </button>
              </div>

              {settings && (
                <div className="space-y-5">
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bus className="w-4 h-4" /> 출근 정류장 ID
                    </label>
                    <input
                      type="text"
                      value={settings.commuteStation?.stationId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        commuteStation: { ...settings.commuteStation, stationId: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                      placeholder="경기버스 정류장 ID"
                    />
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bus className="w-4 h-4" /> 퇴근 정류장 ID
                    </label>
                    <input
                      type="text"
                      value={settings.homeStation?.stationId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        homeStation: { ...settings.homeStation, stationId: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                      placeholder="서울버스 정류장 ID"
                    />
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium ${theme.text} mb-2`}>
                      <Bell className="w-4 h-4" /> 아침 알림 시간
                    </label>
                    <input
                      type="time"
                      value={settings.notifications?.morning || '07:00'}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, morning: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-xl border ${theme.border} bg-transparent ${theme.text} text-sm`}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full py-2.5 rounded-xl ${theme.badge} font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '저장 중...' : '설정 저장'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: App.jsx에 설정 패널 추가**

```jsx
// client/src/App.jsx 에 SettingsPanel import 추가
import SettingsPanel from './components/SettingsPanel';

// return 내부에 추가:
<SettingsPanel theme={theme} />
```

- [ ] **Step 3: 커밋**

```bash
git add client/src
git commit -m "feat: 설정 패널 (정류장/알림 설정)"
```

---

## Task 12: Electron 래퍼

**Files:**
- Create: `electron/package.json`
- Create: `electron/main.js`
- Create: `electron/preload.js`
- Create: `electron/notifier.js`

- [ ] **Step 1: electron/package.json 생성**

```json
{
  "name": "my-ai-electron",
  "version": "0.1.0",
  "private": true,
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron ."
  },
  "dependencies": {
  },
  "devDependencies": {
    "electron": "^28.2.0"
  }
}
```

- [ ] **Step 2: Electron main.js 생성**

```js
// electron/main.js
const { app, BrowserWindow, Notification, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

const isDev = process.env.NODE_ENV === 'development';
const CLIENT_URL = isDev ? 'http://localhost:3000' : (process.env.SERVER_URL || 'http://localhost:5001');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(CLIENT_URL);

  if (isDev) mainWindow.webContents.openDevTools();
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  const contextMenu = Menu.buildFromTemplate([
    { label: 'My AI 열기', click: () => mainWindow.show() },
    { label: '새로고침', click: () => mainWindow.reload() },
    { type: 'separator' },
    { label: '종료', click: () => app.quit() },
  ]);
  tray.setToolTip('My AI - 생활 대시보드');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // 알림 스케줄러
  const { startNotifier } = require('./notifier');
  startNotifier();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

- [ ] **Step 3: preload.js 생성**

```js
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
  platform: process.platform,
});
```

- [ ] **Step 4: notifier.js 생성**

```js
// electron/notifier.js
const { Notification } = require('electron');

function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

function startNotifier() {
  // 매분 시간 체크해서 알림
  setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    if (h === 7 && m === 0) {
      showNotification('☀️ 좋은 아침!', '오늘의 출근 정보와 날씨를 확인해보세요.');
    }
    if (h === 17 && m === 30) {
      showNotification('🌙 퇴근 시간!', '퇴근 버스 정보를 확인해보세요.');
    }
  }, 60000);
}

module.exports = { startNotifier, showNotification };
```

- [ ] **Step 5: 커밋**

```bash
git add electron/
git commit -m "feat: Electron 데스크톱 래퍼 + 알림 스케줄러"
```

---

## Task 13: OCI 서버 배포 설정

**Files:**
- Create: `server/ecosystem.config.js` (PM2 설정)
- Modify: `client/vite.config.js` (빌드 출력 경로)
- Modify: `server/src/index.js` (static 파일 서빙)

- [ ] **Step 1: PM2 설정 파일 생성**

```js
// server/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-ai',
    script: 'src/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5001,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
  }],
};
```

- [ ] **Step 2: 서버에서 클라이언트 빌드 결과 서빙**

```js
// server/src/index.js 에 추가 (라우트 정의 전)
const path = require('path');

// 프로덕션: 클라이언트 빌드 결과물 서빙
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// ... 기존 라우트들 ...

// 프로덕션: SPA 폴백
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    }
  });
}
```

- [ ] **Step 3: 빌드 스크립트 추가 (루트 package.json)**

```json
"scripts": {
  "deploy": "npm run build && echo 'Build complete. Upload to OCI server.'"
}
```

- [ ] **Step 4: 커밋**

```bash
git add .
git commit -m "feat: OCI 배포 설정 (PM2, static serving)"
```

---

## Task 14: 통합 테스트 + 최종 정리

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`
Expected: 모든 테스트 통과

- [ ] **Step 2: 서버 + 클라이언트 동시 실행 테스트**

Run: `npm run dev`
Expected: http://localhost:3000 에서 대시보드 표시, API 프록시 동작

- [ ] **Step 3: 클라이언트 빌드 테스트**

Run: `npm run build`
Expected: `client/dist/` 생성

- [ ] **Step 4: README.md 업데이트**

기본 설치/실행 방법 문서화

- [ ] **Step 5: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "docs: README 업데이트 + 통합 테스트 완료"
git push origin main
```

---

## Execution Summary

| Task | 설명 | 예상 시간 |
|------|------|----------|
| 1 | 프로젝트 초기 설정 | 5분 |
| 2 | Express + 시간대 유틸 | 5분 |
| 3 | 날씨 서비스 | 8분 |
| 4 | 버스 도착정보 서비스 | 8분 |
| 5 | 뉴스 서비스 | 5분 |
| 6 | AI 메시지 서비스 | 8분 |
| 7 | 설정 API + 대시보드 통합 | 5분 |
| 8 | 클라이언트 초기 셋업 | 5분 |
| 9 | 테마 + 커스텀 훅 | 5분 |
| 10 | 카드 컴포넌트들 | 10분 |
| 11 | 설정 패널 | 5분 |
| 12 | Electron 래퍼 | 5분 |
| 13 | OCI 배포 설정 | 5분 |
| 14 | 통합 테스트 + 정리 | 5분 |
| **합계** | | **~84분** |
