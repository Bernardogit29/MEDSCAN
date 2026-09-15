import axios from "axios";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

function getDevServerHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const scriptMatch = scriptURL?.match(/\/\/([^/:]+)/);
  if (scriptMatch?.[1]) {
    return scriptMatch[1];
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  return hostUri?.split(":")[0] || null;
}

function isLoopbackHost(host) {
  return host === "localhost" || host === "127.0.0.1";
}

function isTunnelHost(host) {
  return host.endsWith(".exp.direct") || host.endsWith(".ngrok.io") || host.endsWith(".ngrok-free.app");
}

function isLoopbackApiUrl(value) {
  try {
    const parsed = new URL(value);
    return isLoopbackHost(parsed.hostname);
  } catch (_error) {
    return false;
  }
}

function getEnvApiUrl() {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!value) {
    return null;
  }

  if (Platform.OS !== "web" && isLoopbackApiUrl(value)) {
    return null;
  }

  return value;
}

function getDefaultApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  const devServerHost = getDevServerHost();
  if (devServerHost && !isLoopbackHost(devServerHost) && !isTunnelHost(devServerHost)) {
    return `http://${devServerHost}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

export const API_URL = getEnvApiUrl() || getDefaultApiUrl();
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
