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
  it('strips HTML tags from title and description', () => {
    const mockData = {
      items: [
        {
          title: '<b>테스트</b> 뉴스 제목',
          description: '뉴스 <b>설명</b>입니다',
          link: 'https://news.example.com/1',
          pubDate: 'Tue, 25 Mar 2026 09:00:00 +0900',
        }
      ]
    };
    const result = parseNewsResponse(mockData);
    assert.strictEqual(result[0].title, '테스트 뉴스 제목');
    assert.strictEqual(result[0].description, '뉴스 설명입니다');
  });
});
