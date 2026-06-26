import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { API_URL, setAuthToken } from "../api/client";
import { getStoredItem, removeStoredItem, setStoredItem } from "../utils/storage";

const AuthContext = createContext(null);
const SESSION_KEY = "medscan.session";

async function authRequest(path, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw { response: { data } };
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const storedSession = await getStoredItem(SESSION_KEY);

        if (!storedSession || !mounted) {
          return;
        }

        const session = JSON.parse(storedSession);

        if (session?.token && session?.user) {
          setUser(session.user);
          setToken(session.token);
          setAuthToken(session.token);
        }
      } catch (_error) {
        await removeStoredItem(SESSION_KEY);
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function applySession(session) {
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
    await setStoredItem(
      SESSION_KEY,
      JSON.stringify({
        user: session.user,
        token: session.token
      })
    );
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const data = await authRequest("/auth/login", { email, password });
      await applySession(data);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, email, password) {
    setLoading(true);
    try {
      const data = await authRequest("/auth/register", { name, email, password });
      await applySession(data);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function refreshMe() {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data;
  }

  async function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await removeStoredItem(SESSION_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      bootstrapping,
      login,
      register,
      refreshMe,
      logout
    }),
    [user, token, loading, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
