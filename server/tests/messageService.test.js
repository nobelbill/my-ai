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
