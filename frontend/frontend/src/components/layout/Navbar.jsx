import React from 'react';
import { Menu, Bell, User, CheckCircle2, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../auth/useAuth.jsx';

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return null;
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

export function Navbar({ onMenuClick, email, profile }) {
  const updatedAtLabel = formatUpdatedAt(profile?.updatedAt);
  const status = profile?.status; // 'idle' | 'loading' | 'loaded' | 'error'
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-saas-800 bg-saas-900/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-saas-400 hover:bg-saas-800 hover:text-saas-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-white sm:inline-block">
            Elevate AI
          </span>
        </div>

        {/* Profile status pill */}
        <div className="hidden md:flex items-center">
          {email?.trim() ? (
            <div
              className={cn(
                "ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                status === "loading" && "border-saas-700 bg-saas-900 text-saas-300",
                status === "loaded" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                status === "error" && "border-red-500/20 bg-red-500/10 text-red-300",
                (!status || status === "idle") && "border-saas-700 bg-saas-900 text-saas-300"
              )}
              title={updatedAtLabel ? `Last synced: ${updatedAtLabel}` : "Profile not synced yet"}
            >
              {status === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : status === "loaded" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
              <span className="truncate max-w-[220px]">
                {status === "loading"
                  ? "Loading profile…"
                  : status === "loaded"
                  ? updatedAtLabel
                    ? `Profile synced · ${updatedAtLabel}`
                    : "Profile synced"
                  : status === "error"
                  ? "Profile not found (save skills)"
                  : "Enter email to load profile"}
              </span>
            </div>
          ) : (
            <div className="ml-2 inline-flex items-center gap-2 rounded-full border border-saas-700 bg-saas-900 px-3 py-1 text-xs font-semibold text-saas-300">
              <User className="h-3.5 w-3.5" />
              Enter email to load profile
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Auth controls */}
        <div className="hidden sm:flex items-center">
          {auth.isAuthed ? (
            <button
              onClick={auth.logout}
              className="inline-flex items-center gap-2 rounded-lg border border-saas-700 bg-saas-900 px-3 py-2 text-sm font-medium text-saas-100 hover:bg-saas-800"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-saas-300" />
              Logout
            </button>
          ) : (
            <GoogleLogin
              onSuccess={(cred) => auth.loginWithGoogleCredential(cred.credential)}
              onError={() => console.error("Google login failed")}
              theme="filled_black"
              size="medium"
              shape="pill"
              text="signin_with"
            />
          )}
        </div>

        <button className="relative rounded-full p-2 text-saas-400 hover:bg-saas-800 hover:text-saas-50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-light"></span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-saas-800 border border-saas-700 cursor-pointer">
          <User className="h-5 w-5 text-saas-400" />
        </div>
      </div>
    </header>
  );
}
