import React from 'react';
import { Menu, Bell, User, LogOut, Cpu, Search, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../auth/useAuth.jsx';

export function Navbar({ onMenuClick }) {
  const auth = useAuth();

  return (
    <header className="fixed top-0 z-[60] flex h-20 w-full items-center justify-between border-b border-white/5 bg-[#020617]/50 px-6 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-lg shadow-primary/20 ring-1 ring-white/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-lg font-black tracking-tighter text-white leading-none">
              Elevate AI
            </span>
            <span className="text-[10px] font-black text-primary-light uppercase tracking-[0.2em] mt-1">Intelligence v2.0</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center ml-8 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-light transition-colors" />
            <input 
                type="text" 
                placeholder="Search intelligence..." 
                className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all w-64"
            />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Engine Ready</span>
        </div>

        <button className="relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/5">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary-light ring-2 ring-[#020617]"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-white truncate max-w-[150px]">{auth.user?.name || 'Explorer'}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{auth.user?.email ? 'Verified User' : 'Guest Mode'}</span>
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-800 border border-white/10 cursor-pointer hover:border-primary/50 transition-all shadow-lg shadow-black/20">
            {auth.user?.picture ? (
              <img src={auth.user.picture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-slate-400" />
            )}
          </div>

          <button 
            onClick={() => auth.logout()}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
