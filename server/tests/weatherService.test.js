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
