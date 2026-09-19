export const AUTH_TIMEOUT_MS = 60000;

export async function requestSession(baseUrl, path, payload, fetchImpl = fetch, timeoutMs = AUTH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(response.status === 401 ? "E-mail ou senha incorretos." : response.status >= 500 ? "O serviço está temporariamente indisponível. Tente novamente em instantes." : data.message || "Não foi possível concluir o acesso.");
      error.response = { status: response.status, data: { message: error.message } };
      throw error;
    }
    if (!data.token || !data.user) throw new Error("O servidor não retornou uma sessão válida. Tente novamente.");
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("O servidor demorou para responder. Aguarde alguns instantes e tente novamente.");
    if (error instanceof TypeError) throw new Error("Não foi possível conectar. Verifique sua internet e tente novamente.");
    throw error;
  } finally { clearTimeout(timeoutId); }
}
