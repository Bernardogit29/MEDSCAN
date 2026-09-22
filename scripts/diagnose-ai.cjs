// Read-only provider check. Never print credentials, prompts, or raw Axios errors.
const path = require('node:path');
const root = path.resolve(__dirname, '../medscan-api');
require(path.join(root, 'node_modules/dotenv')).config({ path: path.join(root, '.env') });
const axios = require(path.join(root, 'node_modules/axios'));
async function main() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const model = (process.argv.find(arg => arg.startsWith('--model='))?.slice(8) || process.env.GEMINI_MODEL || 'gemini-3.6-flash').replace(/^models\//, '').trim();
  if (!key) { console.log(JSON.stringify({ configured: false })); return; }
  const client = axios.create({ baseURL: 'https://generativelanguage.googleapis.com/v1beta', timeout: 30000, headers: { 'x-goog-api-key': key } });
  if (process.argv.includes('--analysis')) {
    process.env.GEMINI_MODEL = model;
    const start = Date.now();
    try {
      const { analyzeMedicalData } = require(path.join(root, 'src/services/aiService'));
      const result = await analyzeMedicalData({ symptoms: 'Caso fictício de teste: adulto de 30 anos, coriza e espirros há dois dias, sem febre ou falta de ar relatadas. Intensidade leve. Sem medicações informadas.' });
      console.log(JSON.stringify({ model: result.model, analysisSucceeded: true, seconds: Math.round((Date.now() - start) / 1000), source: result.source }));
    } catch (error) {
      console.log(JSON.stringify({ model, analysisSucceeded: false, status: error.status, code: error.code, message: error.message }));
    }
    return;
  }
  if (process.argv.includes('--generate')) {
    try {
      const { data } = await client.post(`/models/${encodeURIComponent(model)}:generateContent`, {
        contents: [{ parts: [{ text: 'Responda apenas: OK. Teste técnico sem dados pessoais.' }] }],
        generationConfig: { maxOutputTokens: 128 }
      });
      console.log(JSON.stringify({ model, generationSucceeded: true, finishReason: data.candidates?.[0]?.finishReason }));
    } catch (error) {
      const details = error.response?.data?.error?.details || [];
      console.log(JSON.stringify({ model, generationSucceeded: false, httpStatus: error.response?.status,
        code: error.response?.data?.error?.status || error.code,
        quota: details.flatMap(d => (d.violations || []).map(v => ({ metric: v.quotaMetric, id: v.quotaId, value: v.quotaValue }))),
        retryDelay: details.find(d => d.retryDelay)?.retryDelay
      }));
    }
    return;
  }
  try {
    const { data } = await client.get(`/models/${encodeURIComponent(model)}`);
    console.log(JSON.stringify({ configured: true, model, available: true, generationSupported: data.supportedGenerationMethods?.includes('generateContent') }));
  } catch (error) {
    console.log(JSON.stringify({ configured: true, model, available: false, httpStatus: error.response?.status, code: error.response?.data?.error?.status || error.code }));
  }
  try {
    const { data } = await client.get('/models', { params: { pageSize: 100 } });
    console.log(JSON.stringify({ availableFlashModels: data.models?.filter(m => /flash/.test(m.name) && m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name) }));
  } catch (error) {
    console.log(JSON.stringify({ listFailed: true, httpStatus: error.response?.status, code: error.response?.data?.error?.status || error.code }));
  }
}
main().catch(() => { console.error('Diagnostic failed.'); process.exitCode = 1; });
