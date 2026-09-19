const { test } = require('node:test');
const assert = require('node:assert/strict');
const { withProviderRetry } = require('./providerRetry');
const failure = status => ({ response: { status } });
function clock() { let time = 0; const delays = []; return { delays, now: () => time, advance: ms => { time += ms; }, sleep: async ms => { delays.push(ms); time += ms; } }; }
test('recovers from a temporary 503 without resubmitting a saved analysis', async () => {
  const c = clock(); let calls = 0;
  const result = await withProviderRetry(async timeout => { assert.equal(timeout, 60000); if (++calls === 1) throw failure(503); return { report: 'complete' }; }, c);
  assert.deepEqual(result, { report: 'complete' }); assert.equal(calls, 2); assert.deepEqual(c.delays, [1000]);
});
test('persistent temporary errors stop at three attempts', async () => {
  for (const status of [500, 502, 503, 504]) {
    const c = clock(); let calls = 0; const error = failure(status);
    await assert.rejects(withProviderRetry(async () => { calls++; throw error; }, c), e => e === error);
    assert.equal(calls, 3); assert.deepEqual(c.delays, [1000, 2000]);
  }
});
test('configuration, quota, invalid reports and ambiguous timeouts are not retried', async () => {
  for (const error of [failure(400), failure(401), failure(403), failure(404), failure(429), new Error('invalid report'), { code: 'ECONNABORTED' }]) {
    const c = clock(); let calls = 0;
    await assert.rejects(withProviderRetry(async () => { calls++; throw error; }, c), e => e === error);
    assert.equal(calls, 1); assert.deepEqual(c.delays, []);
  }
});
test('total time budget reduces subsequent request timeout', async () => {
  const c = clock(); const timeouts = [];
  await assert.rejects(withProviderRetry(async timeout => { timeouts.push(timeout); c.advance(timeout); throw failure(503); }, c));
  assert.deepEqual(timeouts, [60000, 59000]); assert.deepEqual(c.delays, [1000]);
});
