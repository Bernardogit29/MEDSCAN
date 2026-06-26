import axios from "axios";
import { NativeModules, Platform } from "react-native";

function getDevServerHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }

  const match = scriptURL.match(/\/\/([^/:]+)/);
  return match?.[1] || null;
}

function getDefaultApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  const devServerHost = getDevServerHost();
  if (devServerHost && devServerHost !== "localhost" && devServerHost !== "127.0.0.1") {
    return `http://${devServerHost}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();
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
