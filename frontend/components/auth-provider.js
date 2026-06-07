"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getMe();
      setSession(data);
      return data;
    } catch {
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(values) {
    const data = await api.login(values);
    setSession(data);
    return data;
  }

  async function register(values) {
    const data = await api.register(values);
    setSession(data);
    return data;
  }

  async function logout() {
    await api.logout();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        profile: session?.profile || null,
        loading,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return value;
}
