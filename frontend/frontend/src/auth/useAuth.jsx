import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../services/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // idle | loading | authed | anon | error
  const [user, setUser] = useState(null);

  const refreshMe = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setStatus("anon");
      setUser(null);
      return;
    }

    // If we're already authed, don't show global loading again
    // We'll use a functional update or just check the current state if needed
    // But for now, simple loading is fine
    setStatus("loading");

    try {
      const res = await authApi.me();
      setUser(res.data?.user || null);
      setStatus("authed");
    } catch (e) {
      console.error(e);
      clearAuthToken();
      setUser(null);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, []); // Run once on mount

  const loginWithGoogleCredential = useCallback(async (credential) => {
    setStatus("loading");
    try {
      const res = await authApi.authGoogle(credential);
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");
      setAuthToken(token);

      // Optimistic user decode
      try {
        const decoded = jwtDecode(token);
        if (decoded?.email) {
          setUser({ email: decoded.email, name: decoded.name, picture: decoded.picture });
        }
      } catch { /* ignore */ }

      await refreshMe();
      return { ok: true };
    } catch (e) {
      console.error(e);
      clearAuthToken();
      setStatus("error");
      return { ok: false };
    }
  }, [refreshMe]);

  const sendLoginOtp = useCallback(async (email) => {
    try {
      await authApi.sendOtp(email);
      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e.response?.data?.error || "Failed to send OTP" };
    }
  }, []);

  const verifyLoginOtp = useCallback(async (email, code) => {
    setStatus("loading");
    try {
      const res = await authApi.verifyOtp(email, code);
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");
      setAuthToken(token);
      
      // Force status to loading so App shows spinner while refreshMe runs
      setStatus("loading");
      await refreshMe();
      return { ok: true };
    } catch (e) {
      console.error(e);
      setStatus("error");
      return { ok: false, error: e.response?.data?.error || "Invalid OTP" };
    }
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setStatus("anon");
  }, []);

  const value = {
    status,
    user,
    isAuthed: status === "authed",
    loginWithGoogleCredential,
    sendLoginOtp,
    verifyLoginOtp,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
