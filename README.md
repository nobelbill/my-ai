# My AI - 시간대별 생활정보 대시보드

시간대에 따라 출퇴근 버스정보, 날씨, 뉴스, AI 생성 명언/메시지를 보여주는 개인 대시보드 앱.

## 기능

- 🌅 **아침 (6-9시)**: 출근 버스 도착정보, 날씨, 오늘의 명언
- ☀️ **오후 (12-17시)**: 날씨, 주요 뉴스 (IT/경제/정치)
- 🌙 **저녁 (17-21시)**: 퇴근 버스 정보, 하루 마감 메시지

## 기술 스택

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Desktop**: Electron
- **APIs**: 기상청, 경기/서울버스, 네이버 뉴스, Claude AI

## 시작하기

### 설치

```bash
git clone https://github.com/nobelbill/my-ai.git
cd my-ai
npm install
cp .env.example .env
# .env 파일에 API 키 설정
```

### 개발 모드

```bash
npm run dev        # 서버 + 클라이언트 동시 실행
npm run dev:server # 서버만
npm run dev:client # 클라이언트만
```

### 빌드

```bash
npm run build  # 클라이언트 빌드
```

### 테스트

```bash
npm test
```

### OCI 서버 배포

```bash
cd server
pm2 start ecosystem.config.js
```

## API 키 설정

`.env` 파일에 다음 키를 설정하세요:

- `BUS_API_KEY`: [공공데이터포털](https://data.go.kr) 버스 API 키
- `WEATHER_API_KEY`: [공공데이터포털](https://data.go.kr) 기상청 API 키
- `KAKAO_APP_KEY`: [카카오 개발자](https://developers.kakao.com) 앱 키
- `NAVER_CLIENT_ID/SECRET`: [네이버 개발자](https://developers.naver.com) 검색 API
- `ANTHROPIC_API_KEY`: [Anthropic](https://console.anthropic.com) Claude API 키
