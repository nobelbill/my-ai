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
