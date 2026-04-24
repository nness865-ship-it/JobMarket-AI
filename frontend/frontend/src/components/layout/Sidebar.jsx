import React from 'react';
import { Home, User, Briefcase, Map, TrendingUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NAV = [
  { name: 'Dashboard', icon: Home, id: 'dashboard' },
  { name: 'Skill Profile', icon: User, id: 'skills' },
  { name: 'Recommendations', icon: Briefcase, id: 'recommendations' },
  { name: 'Roadmap', icon: Map, id: 'roadmap' },
  { name: 'Trends', icon: TrendingUp, id: 'trends' },
];

export function Sidebar({ open, setOpen, activeTab, setActiveTab }) {
  const NavLinks = ({ onClick }) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
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
              "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary-light" 
                : "text-saas-400 hover:bg-saas-800 hover:text-saas-50"
            )}
          >
            <Icon className={cn(
              "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
              isActive ? "text-primary-light" : "text-saas-500 group-hover:text-saas-300"
            )} />
            {item.name}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-saas-950/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-saas-800 bg-saas-900 shadow-xl md:hidden flex flex-col pt-5 pb-4"
            >
              <div className="flex items-center justify-between px-4 pb-4">
                <span className="text-xl font-bold tracking-tight text-white">Elevate AI</span>
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-saas-800 text-saas-400"
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

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16 border-r border-saas-800 bg-saas-900 z-20">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-saas-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold font-white">JD</div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Jane Doe</span>
              <span className="text-xs text-saas-400 truncate w-32">jane@example.com</span>
            </div>
        </div>
      </div>
    </>
  );
}
