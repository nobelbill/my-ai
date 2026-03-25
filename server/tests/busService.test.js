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
