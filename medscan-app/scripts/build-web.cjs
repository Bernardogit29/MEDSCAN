// Environment values marked EXPO_PUBLIC_* are embedded in the browser bundle.
const { spawnSync } = require('node:child_process');

process.env.NODE_ENV = 'production';
require('@expo/env').load(process.cwd());

let apiUrl;
try {
  apiUrl = new URL(process.env.EXPO_PUBLIC_API_URL?.trim());
} catch {
  console.error('Configure EXPO_PUBLIC_API_URL no Environment do Static Site com a URL HTTPS da API, terminando em /api.');
  process.exit(1);
}

if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password ||
    apiUrl.search || apiUrl.hash || !/\/api\/?$/.test(apiUrl.pathname) ||
    ['localhost', '127.0.0.1', '[::1]'].includes(apiUrl.hostname)) {
  console.error('O build do site exige EXPO_PUBLIC_API_URL com uma API HTTPS pública, sem credenciais e terminando em /api.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'export', '--platform', 'web'], {
  stdio: 'inherit',
  env: process.env
});
if (result.error) {
  console.error('Não foi possível iniciar a exportação web.');
  process.exit(1);
}
process.exit(result.status ?? 1);
