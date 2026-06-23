import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  BarChart3, 
  User, 
  History, 
  Shield, 
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Mock Interview', path: '/interview', icon: BookOpen },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Interview History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Show Admin Panel option if is_admin is true
  if (user?.is_admin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} bg-darkCard border-r border-slate-800 flex flex-col justify-between`}>
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-sans tracking-wide">
                PrepAI
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed && (
          <div className="mb-4 px-2 py-1.5 rounded-lg bg-slate-800/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group`}
          title={isCollapsed ? 'Log Out' : ''}
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
