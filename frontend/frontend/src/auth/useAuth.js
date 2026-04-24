import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authGoogle, me as meApi } from "../services/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./token";

export function useAuth() {
  const [status, setStatus] = useState("idle"); // idle | loading | authed | anon | error
  const [user, setUser] = useState(null);

  const refreshMe = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setStatus("anon");
      setUser(null);
      return;
    }

    setStatus("loading");
    try {
      const res = await meApi();
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
  }, [refreshMe]);

  const loginWithGoogleCredential = useCallback(async (credential) => {
    setStatus("loading");
    try {
      const res = await authGoogle(credential);
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");
      setAuthToken(token);

      // Optimistic user decode for instant UI
      try {
        const decoded = jwtDecode(token);
        if (decoded?.email) {
          setUser({ email: decoded.email, name: decoded.name, picture: decoded.picture });
        }
      } catch {
        // ignore decode error
      }

      await refreshMe();
      return { ok: true };
    } catch (e) {
      console.error(e);
      clearAuthToken();
      setStatus("error");
      return { ok: false };
    }
  }, [refreshMe]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setStatus("anon");
  }, []);

  return useMemo(
    () => ({
      status,
      user,
      isAuthed: status === "authed",
      loginWithGoogleCredential,
      logout,
      refreshMe,
    }),
    [status, user, loginWithGoogleCredential, logout, refreshMe]
  );
}

