import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout({ children, activeTab, setActiveTab, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-50 selection:bg-primary/30">
      <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} onLogout={onLogout} />
      
      <div className="flex overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden md:pl-64 focus:outline-none bg-[#020617] pt-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 w-full min-h-[calc(100vh-80px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
