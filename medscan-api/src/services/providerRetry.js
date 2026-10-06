const TRANSIENT_STATUSES = new Set([500, 502, 503, 504]);
const TOTAL_TIMEOUT_MS = 120000;

// Retries only the provider call, before any analysis is saved to the database.
async function withProviderRetry(request, {
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  now = Date.now,
  maxAttempts = 3,
  retryDelay = (_error, attempt) => Math.min(1000 * (2 ** attempt), 8000),
  shouldRetry = error => TRANSIENT_STATUSES.has(error.response?.status)
} = {}) {
  const deadline = now() + TOTAL_TIMEOUT_MS;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const timeout = Math.min(60000, deadline - now());
    if (timeout <= 0) throw Object.assign(new Error('Provider deadline exceeded'), { code: 'ETIMEDOUT' });
    try {
      return await request(timeout, attempt);
    } catch (error) {
      if (attempt === maxAttempts - 1 || !shouldRetry(error, attempt)) throw error;
      const delay = Math.max(0, retryDelay(error, attempt));
      if (deadline - now() <= delay) throw error;
      await sleep(delay);
    }
  }
}

module.exports = { withProviderRetry };
