require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  busApiKey: process.env.BUS_API_KEY,
  kakaoAppKey: process.env.KAKAO_APP_KEY,
  weatherApiKey: process.env.WEATHER_API_KEY,
  newsApiKey: process.env.NEWS_API_KEY,
};
