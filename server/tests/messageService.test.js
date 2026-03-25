const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getMessage, QUOTES } = require('../src/services/messageService');

describe('QUOTES', () => {
  it('has quotes for all time slots', () => {
    assert.ok(QUOTES.morning.length > 0);
    assert.ok(QUOTES.afternoon.length > 0);
    assert.ok(QUOTES.evening.length > 0);
    assert.ok(QUOTES.idle.length > 0);
  });
});

describe('getMessage', () => {
  it('returns a message object for morning', () => {
    const msg = getMessage('morning');
    assert.ok(msg.quote);
    assert.ok(msg.message);
  });

  it('returns a message object for afternoon', () => {
    const msg = getMessage('afternoon');
    assert.ok(msg.message);
  });

  it('falls back to idle for unknown slot', () => {
    const msg = getMessage('unknown');
    assert.ok(msg.message);
  });
});
