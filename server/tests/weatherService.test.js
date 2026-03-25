const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseWeatherResponse, getLocation } = require('../src/services/weatherService');

describe('getLocation', () => {
  it('returns coordinates for 고양시', () => {
    const loc = getLocation('goyang');
    assert.ok(loc.lat);
    assert.ok(loc.lon);
  });
});

describe('parseWeatherResponse', () => {
  it('parses Open-Meteo response correctly', () => {
    const mockResponse = {
      current: {
        temperature_2m: 15.3,
        weather_code: 0,
        relative_humidity_2m: 65,
        wind_speed_10m: 7.2,
      }
    };
    const result = parseWeatherResponse(mockResponse);
    assert.strictEqual(result.temperature, '15');
    assert.strictEqual(result.sky, '맑음');
    assert.strictEqual(result.precipitation, '없음');
    assert.strictEqual(result.humidity, '65');
  });

  it('parses rainy weather code', () => {
    const mockResponse = {
      current: {
        temperature_2m: 8.0,
        weather_code: 61,
        relative_humidity_2m: 90,
        wind_speed_10m: 10.0,
      }
    };
    const result = parseWeatherResponse(mockResponse);
    assert.strictEqual(result.sky, '비');
    assert.strictEqual(result.precipitation, '비');
  });
});
