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
  it('parses NewsAPI.org response and strips HTML', () => {
    const mockData = {
      articles: [
        {
          title: '<b>테스트</b> 뉴스 제목',
          description: '뉴스 <b>설명</b>입니다',
          url: 'https://news.example.com/1',
          publishedAt: '2026-03-25T09:00:00Z',
        }
      ]
    };
    const result = parseNewsResponse(mockData);
    assert.strictEqual(result[0].title, '테스트 뉴스 제목');
    assert.strictEqual(result[0].description, '뉴스 설명입니다');
    assert.strictEqual(result[0].link, 'https://news.example.com/1');
  });
});
