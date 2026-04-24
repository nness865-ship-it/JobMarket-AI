import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-saas-950 font-sans text-saas-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden md:pl-64 focus:outline-none bg-saas-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
