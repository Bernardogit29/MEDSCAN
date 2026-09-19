const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { analyzeMedicalData, validateAnalysis } = require('./aiService');
const originalPost = axios.post;
const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;
afterEach(() => {
  axios.post = originalPost;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL = originalModel;
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
  await assert.rejects(analyzeMedicalData({ symptoms: 'tosse' }), error => error.status === 503 && /limite/.test(error.message));
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
