// Uses only the existing, explicitly identified QA account. No user health data.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
async function main() {
  const session = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'medscan-qa-session.json'), 'utf8'));
  const publicBase = 'https://medscan-api-f658.onrender.com/api';
  const base = process.argv.includes('--local') ? 'http://localhost:3000/api' : publicBase;
  if (session.base !== publicBase || !/^medscan-qa-\d+@example\.invalid$/.test(session.email)) throw Error('Existing QA account unavailable');
  const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: session.email, password: session.password }), signal: AbortSignal.timeout(60000) });
  const account = await login.json();
  if (!login.ok || !account.token) throw Error('QA login failed');
  const start = Date.now();
  const response = await fetch(base + '/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${account.token}` }, body: JSON.stringify({ type: 'symptoms', symptoms: 'Caso fictício de teste técnico: adulto de 30 anos, coriza e espirros há dois dias, intensidade leve. Sem febre ou falta de ar relatadas.', monitoredPersonId: 'self' }), signal: AbortSignal.timeout(150000) });
  const data = await response.json();
  console.log(JSON.stringify({ target: base, status: response.status, seconds: Math.round((Date.now()-start)/1000), provider: data.analysis?.result?.source, model: data.analysis?.result?.model, code: data.code, message: response.ok ? 'QA analysis created successfully' : data.message }));
}
main().catch(error => { console.error(JSON.stringify({ checkFailed: true, message: error.message })); process.exitCode = 1; });
