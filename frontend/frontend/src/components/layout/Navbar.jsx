import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../auth/useAuth.jsx';

export function Navbar({ onMenuClick }) {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
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
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative rounded-full p-2 text-saas-400 hover:bg-saas-800 hover:text-saas-50 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary-light ring-2 ring-saas-900"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 border-l border-saas-800 ml-2">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white truncate max-w-[150px]">{auth.user?.name || 'Explorer'}</span>
            <span className="text-xs text-saas-500 truncate max-w-[150px]">{auth.user?.email}</span>
          </div>
          <div className="group relative">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-saas-800 border border-saas-700 cursor-pointer hover:border-primary/50 transition-all">
              {auth.user?.picture ? (
                <img src={auth.user.picture} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-saas-400" />
              )}
            </div>
          </div>
          <button 
            onClick={() => auth.logout()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-saas-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
