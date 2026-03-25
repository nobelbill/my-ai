const { describe, it } = require('node:test');
const assert = require('node:assert');
const { parseSeoulBusResponse } = require('../src/services/busService');

describe('parseSeoulBusResponse', () => {
  it('parses Seoul bus XML response', () => {
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
    <ServiceResult><msgBody><itemList>
      <rtNm>9711</rtNm><arrmsg1>5분후[2번째 전]</arrmsg1><arrmsg2>17분후[5번째 전]</arrmsg2>
      <adirection>양재역</adirection><stNm>고양경찰서</stNm>
    </itemList></msgBody></ServiceResult>`;
    const result = parseSeoulBusResponse(mockXml);
    assert.strictEqual(result[0].routeName, '9711');
    assert.strictEqual(result[0].firstArrival, '5분후[2번째 전]');
    assert.strictEqual(result[0].direction, '양재역');
  });

  it('handles empty response', () => {
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
    <ServiceResult><msgBody></msgBody></ServiceResult>`;
    const result = parseSeoulBusResponse(mockXml);
    assert.strictEqual(result.length, 0);
  });
});
