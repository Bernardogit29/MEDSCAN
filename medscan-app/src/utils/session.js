export function isSessionUsable(session, now = Date.now()) {
  if (!session?.user || typeof session.token !== 'string') return false;
  try {
    const payload = session.token.split('.')[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    // Only a UI freshness check. The API verifies the signature and account.
    return typeof claims.exp === 'number' && claims.exp * 1000 > now;
  } catch (_) { return false; }
}
