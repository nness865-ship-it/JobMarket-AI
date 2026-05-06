import React from 'react';
import { Home, User, Briefcase, Map, TrendingUp, X, Target, LayoutDashboard, BrainCircuit, FileText, Rocket, FolderGit2, Settings, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
const MOCK_NAV = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Resume Analysis', icon: FileText, id: 'resume-analysis' },
  { name: 'Job Recommendations', icon: Briefcase, id: 'recommendations' },
  { name: 'Career Pathways', icon: Target, id: 'pathways' },
  { name: 'Roadmaps', icon: Map, id: 'roadmap' },
  { name: 'Market Trends', icon: TrendingUp, id: 'trends' },
  { name: 'Skill Tracker', icon: Activity, id: 'skill-tracker' },
];
export function Sidebar({ open, setOpen, activeTab, setActiveTab, user }) {
  const NavLinks = ({ onClick }) => (
    <nav className="flex-1 space-y-1 px-4 py-6">
      {MOCK_NAV.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClick) onClick();
            }}
            className={cn(
              "group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary-light shadow-sm shadow-primary/5" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
          >
            <Icon className={cn(
              "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
              isActive ? "text-primary-light" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {item.name}
          </button>
        );
      })}
    </nav>
  );
  return (
    <>
      {}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-[#020617] shadow-2xl md:hidden flex flex-col pt-5 pb-4"
            >
              <div className="flex items-center justify-between px-6 pb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-white">Elevate AI</span>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 hover:bg-slate-800 text-slate-400"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-1 overflow-y-auto">
                <NavLinks onClick={() => setOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-20 border-r border-white/5 bg-[#020617] z-20">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-6 border-t border-white/5 bg-slate-900/20">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/20 shrink-0">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EX'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">{user?.name || 'Explorer'}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                    {user?.email ? user.email.split('@')[0] : 'Guest Session'}
                  </span>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}