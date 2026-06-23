import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import { Menu, Sun, Moon, Award } from 'lucide-react';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex">
      {/* CSS Styles for Light Theme Overrides */}
      <style>{`
        body.light-theme {
          background-color: #F8FAFC !important;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.03) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.03) 0px, transparent 50%) !important;
          color: #0F172A !important;
        }
        body.light-theme .glass-card, 
        body.light-theme aside {
          background-color: #FFFFFF !important;
          border-color: #E2E8F0 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
        }
        body.light-theme .text-slate-400 {
          color: #64748B !important;
        }
        body.light-theme .text-slate-300 {
          color: #475569 !important;
        }
        body.light-theme .text-white {
          color: #0F172A !important;
        }
        body.light-theme .bg-slate-800\\/50 {
          background-color: #F1F5F9 !important;
        }
        body.light-theme .bg-slate-800\\/40 {
          background-color: #E2E8F0\\/50 !important;
        }
        body.light-theme .border-slate-800 {
          border-color: #E2E8F0 !important;
        }
        body.light-theme input, 
        body.light-theme select, 
        body.light-theme textarea {
          background-color: #F1F5F9 !important;
          border-color: #CBD5E1 !important;
          color: #0F172A !important;
        }
        body.light-theme .hover\\:bg-slate-800\\/50:hover {
          background-color: #F1F5F9 !important;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'} flex flex-col`}>
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 bg-darkBg/80 backdrop-blur z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold font-sans text-white tracking-wide">
              InterviewPrep AI
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              title="Toggle Theme"
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            {/* User Profile Summary */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {user?.is_admin ? 'Platform Admin' : 'Job Seeker'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
