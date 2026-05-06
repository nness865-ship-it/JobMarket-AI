import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../services/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, authed, anon

  const refreshMe = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStatus("anon");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // Check expiry — if exp is missing, treat token as valid
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        clearAuthToken();
        setUser(null);
        setStatus("anon");
        return;
      }

      const res = await authApi.me();
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setStatus("authed");
      } else {
        throw new Error("Invalid user data");
      }
    } catch (e) {
      console.error("Auth refresh failed:", e);
      clearAuthToken();
      setUser(null);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const loginWithGoogleCredential = useCallback(async (credential) => {
    try {
      const res = await authApi.authGoogle(credential);
      if (res.data && res.data.token) {
        setAuthToken(res.data.token);
        await refreshMe();
        return { ok: true };
      }
      return { ok: false, error: "No token received" };
    } catch (e) {
      console.error("Login Error:", e);
      const msg = e.response?.data?.error || e.message || "Google login failed";
      return { ok: false, error: msg };
    }
  }, [refreshMe]);

  const loginWithDemo = useCallback(async () => {
    try {
      const res = await authApi.authDemo();
      if (res.data && res.data.token) {
        setAuthToken(res.data.token);
        await refreshMe();
        return { ok: true };
      }
      return { ok: false, error: "No token received" };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e.response?.data?.error || "Demo login failed" };
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
    try {
      const res = await authApi.verifyOtp(email, code);
      if (res.data && res.data.token) {
        setAuthToken(res.data.token);
        await refreshMe();
        return { ok: true };
      }
      return { ok: false, error: "No token received" };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e.response?.data?.error || "Invalid OTP" };
    }
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setStatus("anon");
  }, []);

  const value = {
    user,
    status,
    isAuthed: status === "authed",
    isLoading: status === "loading",
    loginWithGoogleCredential,
    loginWithDemo,
    sendLoginOtp,
    verifyLoginOtp,
    logout,
    refreshMe
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
