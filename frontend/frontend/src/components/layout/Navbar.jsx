import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar({ onMenuClick }) {
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
      </div>
      <div className="flex items-center gap-4">
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
