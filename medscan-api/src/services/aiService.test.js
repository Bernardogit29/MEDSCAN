const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { analyzeMedicalData, validateAnalysis } = require('./aiService');
const originalPost = axios.post;
const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;
const originalFallback = process.env.GEMINI_FALLBACK_MODEL;
const groqKeys = ['GROQ_API_KEY', 'GROQ_MODEL', 'GROQ_FALLBACK_ENABLED'];
const originalGroq = Object.fromEntries(groqKeys.map(key => [key, process.env[key]]));
beforeEach(() => { for (const key of groqKeys) delete process.env[key]; });
afterEach(() => {
  axios.post = originalPost;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL = originalModel;
  if (originalFallback === undefined) delete process.env.GEMINI_FALLBACK_MODEL; else process.env.GEMINI_FALLBACK_MODEL = originalFallback;
  for (const key of groqKeys) {
    if (originalGroq[key] === undefined) delete process.env[key]; else process.env[key] = originalGroq[key];
  }
});
function response() {
  return {
    possibleCondition: 'Tosse e desconforto no peito', riskLevel: 'Indeterminado', recommendation: 'É necessário esclarecer os sintomas associados.',
    details: 'Você relatou tosse e desconforto. Faltam duração e intensidade para orientar o próximo passo.', visualFindings: '',
    report: { summary: 'Tosse acompanhada de desconforto no peito.', relevantFindings: ['Tosse', 'Desconforto no peito'],
      possibleExplanations: ['Os sintomas podem ter diferentes causas que precisam ser avaliadas.'], redFlags: ['Observe dificuldade para respirar.'], nextSteps: ['Informe a duração.'], whenToSeekCare: 'Procure avaliação conforme evolução e sinais associados.', questionsForClinician: ['Há quanto tempo começou?'], limitations: 'Sem exame físico.' }
  };
}
function mockResponse(value, finishReason = 'STOP') {
  axios.post = async () => ({ data: { candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(value) }] } }] } });
}
test('missing credentials never fabricate an analysis', async () => {
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(analyzeMedicalData({ symptoms: 'dor' }), error => error.status === 503);
});
test('empty or malformed input is rejected before provider call', async () => {
  await assert.rejects(analyzeMedicalData({}), error => error.status === 400);
  await assert.rejects(analyzeMedicalData({ symptoms: {} }), error => error.status === 400);
});
test('preserves detailed response across body systems and honors configured model', async () => {
  process.env.GEMINI_API_KEY = 'test-only'; process.env.GEMINI_MODEL = 'models/configured-model';
  const payload = response();
  axios.post = async (url, body, config) => {
    assert.match(url, /models\/configured-model:generateContent$/);
    assert.equal(config.headers['x-goog-api-key'], 'test-only');
    assert.match(body.contents[0].parts[0].text, /tosse/);
    assert.equal(body.generationConfig.responseJsonSchema.properties.confidence, undefined);
    return { data: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }] } };
  };
  const result = await analyzeMedicalData({ symptoms: 'tosse e desconforto no peito' });
  assert.deepEqual(result.report, payload.report);
  assert.equal(result.details, payload.details);
  assert.equal(result.confidence, null);
  assert.equal(result.source, 'gemini');
});
test('incomplete reports do not get padded with generic clinical advice', async () => {
  process.env.GEMINI_API_KEY = 'test-only';
  const payload = response(); delete payload.report.nextSteps;
  mockResponse(payload);
  await assert.rejects(analyzeMedicalData({ symptoms: 'tosse' }), error => error.status === 502);
});
test('truncated response is rejected even if JSON parses', async () => {
  process.env.GEMINI_API_KEY = 'test-only'; mockResponse(response(), 'MAX_TOKENS');
  await assert.rejects(analyzeMedicalData({ symptoms: 'tosse' }), error => error.status === 502);
});
test('quota failures are visible instead of converted to a diagnosis', async () => {
  process.env.GEMINI_API_KEY = 'test-only';
  axios.post = async () => { throw { response: { status: 429 } }; };
  await assert.rejects(analyzeMedicalData({ symptoms: 'tosse' }), error => error.status === 429 && error.code === 'AI_QUOTA_EXCEEDED');
});
test('validator rejects empty and malformed report sections', () => {
  const payload = response(); payload.report.redFlags = [{}];
  assert.equal(validateAnalysis(payload), false);
  assert.equal(validateAnalysis(response()), true);
});
test('provider unavailability is distinguished from an incomplete response', async () => {
  process.env.GEMINI_API_KEY = 'test-only';
  axios.post = async () => { throw { response: { status: 503 } }; };
  await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }), error => error.status === 503 && /temporariamente/.test(error.message));
});

test('analysis recovers after provider 503 and preserves the complete validated result', async () => {
  process.env.GEMINI_API_KEY = 'test-only';
  let calls = 0;
  const payload = response();
  axios.post = async () => {
    if (++calls === 1) throw { response: { status: 503 } };
    return { data: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }] } };
  };
  const result = await analyzeMedicalData({ symptoms: 'relato fictício' });
  assert.equal(calls, 2);
  assert.deepEqual(result.report, payload.report);
  assert.equal(result.source, 'gemini');
});

test('server failure switches to configured fallback with identical payload and records actual model', async () => {
  process.env.GEMINI_API_KEY = 'test-only'; process.env.GEMINI_MODEL = 'primary'; process.env.GEMINI_FALLBACK_MODEL = 'models/backup';
  const calls = [];
  axios.post = async (url, body) => {
    calls.push({ url, body });
    if (calls.length === 1) throw { response: { status: 503 } };
    return { data: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(response()) }] } }] } };
  };
  const result = await analyzeMedicalData({ symptoms: 'relato fictício' });
  assert.match(calls[0].url, /primary:generateContent$/);
  assert.match(calls[1].url, /backup:generateContent$/);
  assert.deepEqual(calls[0].body, calls[1].body);
  assert.equal(result.model, 'backup');
});

test('quota, inaccessible models and denied keys do not trigger fallback', async () => {
  process.env.GEMINI_API_KEY = 'test-only'; process.env.GEMINI_FALLBACK_MODEL = 'backup';
  for (const [status, code] of [[429, 'AI_QUOTA_EXCEEDED'], [404, 'AI_MODEL_UNAVAILABLE'], [403, 'AI_ACCESS_DENIED']]) {
    let calls = 0;
    axios.post = async () => { calls++; throw { response: { status } }; };
    await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }), error => error.code === code);
    assert.equal(calls, 1);
  }
});

test('explicit empty fallback retains primary on retry', async () => {
  process.env.GEMINI_API_KEY = 'test-only'; process.env.GEMINI_MODEL = 'primary'; process.env.GEMINI_FALLBACK_MODEL = '';
  let calls = 0;
  axios.post = async (url) => {
    assert.match(url, /primary:generateContent$/);
    if (++calls === 1) throw { response: { status: 503 } };
    return { data: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(response()) }] } }] } };
  };
  assert.equal((await analyzeMedicalData({ symptoms: 'relato fictício' })).model, 'primary');
});

function enableGroq() {
  process.env.GEMINI_API_KEY = 'gemini-test';
  process.env.GROQ_API_KEY = 'groq-test';
  process.env.GROQ_FALLBACK_ENABLED = 'true';
}
const geminiReply = () => ({ data: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(response()) }] } }] } });
const groqReply = () => ({ data: { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(response()) } }] } });

test('Groq reserve preserves the prompt, schema, context and actual provider', async () => {
  enableGroq(); const calls = [];
  axios.post = async (url, body, config) => {
    calls.push({ url, body, config });
    if (calls.length === 1) throw { response: { status: 503 } };
    return groqReply();
  };
  const result = await analyzeMedicalData({ symptoms: 'relato fictício com complemento' });
  assert.equal(calls.length, 2);
  const backup = calls[1];
  assert.equal(backup.url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(backup.config.headers.Authorization, 'Bearer groq-test');
  assert.equal(backup.config.headers['x-goog-api-key'], undefined);
  assert.equal(backup.body.messages[0].content, calls[0].body.systemInstruction.parts[0].text);
  assert.equal(backup.body.messages[1].content, calls[0].body.contents[0].parts[0].text);
  assert.deepEqual(backup.body.response_format.json_schema.schema, calls[0].body.generationConfig.responseJsonSchema);
  assert.equal(result.source, 'groq'); assert.equal(result.model, 'openai/gpt-oss-120b');
  assert.deepEqual(result.report, response().report);
});

test('missing key or disabled reserve never calls Groq', async () => {
  for (const disabled of ['key', 'flag']) {
    enableGroq();
    if (disabled === 'key') delete process.env.GROQ_API_KEY;
    else process.env.GROQ_FALLBACK_ENABLED = 'false';
    let calls = 0;
    axios.post = async url => {
      assert.match(url, /generativelanguage.googleapis.com/);
      if (++calls === 1) throw { response: { status: 503 } };
      return geminiReply();
    };
    assert.equal((await analyzeMedicalData({ symptoms: 'relato fictício' })).source, 'gemini');
  }
});

test('primary success never consumes Groq quota', async () => {
  enableGroq(); let calls = 0;
  axios.post = async url => { calls++; assert.match(url, /generativelanguage.googleapis.com/); return geminiReply(); };
  await analyzeMedicalData({ symptoms: 'relato fictício' });
  assert.equal(calls, 1);
});

test('invalid credentials and ambiguous timeouts do not activate reserve', async () => {
  enableGroq();
  for (const failure of [{ response: { status: 403 } }, { code: 'ECONNABORTED' }, new Error('invalid report')]) {
    let calls = 0;
    axios.post = async () => { calls++; throw failure; };
    await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }));
    assert.equal(calls, 1);
  }
});

test('Gemini quota uses independent Groq once without retrying exhausted provider', async () => {
  enableGroq(); const urls = [];
  axios.post = async url => {
    urls.push(url);
    if (urls.length === 1) throw { response: { status: 429 } };
    return groqReply();
  };
  assert.equal((await analyzeMedicalData({ symptoms: 'relato fictício' })).source, 'groq');
  assert.equal(urls.length, 2);
  assert.match(urls[0], /generativelanguage.googleapis.com/);
  assert.equal(urls[1], 'https://api.groq.com/openai/v1/chat/completions');
});

test('both providers at quota stop after one request each', async () => {
  enableGroq(); let calls = 0;
  axios.post = async () => { calls++; throw { response: { status: 429 } }; };
  await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }), error => error.code === 'AI_QUOTA_EXCEEDED');
  assert.equal(calls, 2);
});

test('Groq is called once only; its errors remain explicit', async () => {
  enableGroq();
  for (const [status, code] of [[503, 'AI_UNAVAILABLE'], [429, 'AI_QUOTA_EXCEEDED'], [401, 'AI_ACCESS_DENIED']]) {
    let calls = 0;
    axios.post = async () => { throw { response: { status: ++calls === 1 ? 503 : status } }; };
    await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }), error => error.code === code);
    assert.equal(calls, 2);
  }
});

test('incomplete, refused and truncated Groq responses are never accepted', async () => {
  enableGroq();
  for (const kind of ['incomplete', 'refused', 'truncated', 'malformed']) {
    let calls = 0;
    axios.post = async () => {
      if (++calls === 1) throw { response: { status: 503 } };
      const result = groqReply(); const choice = result.data.choices[0];
      if (kind === 'incomplete') { const data = response(); delete data.report.nextSteps; choice.message.content = JSON.stringify(data); }
      if (kind === 'refused') choice.message.refusal = 'refused';
      if (kind === 'truncated') choice.finish_reason = 'length';
      if (kind === 'malformed') choice.message.content = 'invalid JSON';
      return result;
    };
    await assert.rejects(analyzeMedicalData({ symptoms: 'relato fictício' }), error => error.code === 'AI_INVALID_RESPONSE');
    assert.equal(calls, 2);
  }
});

test('images remain on Gemini and are never stripped for the text-only reserve', async () => {
  enableGroq();
  const fs = require('node:fs/promises'); const stat = fs.stat; const read = fs.readFile;
  fs.stat = async () => ({ size: 12 }); fs.readFile = async () => 'ZmljdGl0aW91cw==';
  try {
    let calls = 0;
    axios.post = async (url, body) => {
      assert.match(url, /generativelanguage.googleapis.com/);
      assert.equal(body.contents[0].parts[1].inlineData.data, 'ZmljdGl0aW91cw==');
      if (++calls === 1) throw { response: { status: 503 } };
      return geminiReply();
    };
    const result = await analyzeMedicalData({ symptoms: 'relato fictício', image: { path: 'mock-only', mimetype: 'image/png' } });
    assert.equal(result.source, 'gemini'); assert.equal(result.imageReceived, true);
  } finally { fs.stat = stat; fs.readFile = read; }
});
