// Creates one clearly identified test account. Never prints the password or token.
const { randomBytes } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const base = process.env.SMOKE_API_URL || 'http://localhost:3000/api';
async function main() {
  const email = `medscan-qa-${Date.now()}@example.invalid`;
  const password = randomBytes(24).toString('base64url');
  const results = [];
  async function request(path, body, token, method = 'POST') {
    const start = Date.now();
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(90000) });
    const data = await response.json().catch(() => ({}));
    results.push({ path, status: response.status, seconds: Math.round((Date.now()-start)/100)/10 });
    return { response, data };
  }
  const registration = await request('/auth/register', { name: 'MEDSCAN Teste automatizado', age: 30, email, password });
  if (registration.response.status !== 201 || !registration.data.token) throw Error('Registration failed');
  writeFileSync(join(tmpdir(), 'medscan-qa-session.json'), JSON.stringify({ base, email, password, token: registration.data.token }), { mode: 0o600 });
  const login = await request('/auth/login', { email, password });
  if (!login.data.token) throw Error('Login failed');
  const wrong = await request('/auth/login', { email, password: 'intentionally-wrong' });
  if (wrong.response.status !== 401) throw Error('Wrong password accepted');
  const profile = await request('/profile', null, login.data.token, 'GET');
  if (profile.data.user?.email !== email) throw Error('Profile mismatch');
  const duplicate = await request('/auth/register', { name: 'MEDSCAN Teste automatizado', age: 30, email, password });
  if (duplicate.response.status !== 409) throw Error('Duplicate not handled');
  console.log(JSON.stringify({ ok: true, testAccount: email, results }));
}
main().catch(error => { console.error(JSON.stringify({ ok: false, message: error.message })); process.exitCode=1; });
