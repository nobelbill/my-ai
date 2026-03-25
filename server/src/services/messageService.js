const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const { SimpleCache } = require('../utils/cache');

const cache = new SimpleCache(60 * 60 * 1000);

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
