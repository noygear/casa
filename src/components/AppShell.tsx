import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types';
import {
  LayoutDashboard, ClipboardList, Building2, Users,
  LogOut, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/vendors', label: 'Vendors', icon: Users },
];

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (user?.role === 'tenant') return ['/dashboard', '/work-orders'].includes(item.to);
    if (user?.role === 'vendor') return ['/dashboard', '/work-orders'].includes(item.to);
    return true; // AM & PM see everything
  });

  return (
    <div className="flex h-screen bg-obsidian overflow-hidden relative">
      {/* Animated Glowing Gradient Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen animate-glow-pan glow-gradient-bg" />
      {/* Global CSS Noise applied over gradient */}
      <div className="absolute inset-0 z-0 bg-noise pointer-events-none opacity-50 mix-blend-overlay" />

      {/* Sidebar - Added relative/z-10 to stay above background */}
      <aside className={`relative z-10 ${collapsed ? 'w-20' : 'w-64'} flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cre-500 to-cre-700 flex items-center justify-center shrink-0 shadow-lg shadow-cre-500/20">
            <Building2 size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-white leading-tight">Casa</h1>
              <p className="text-[10px] text-gray-500">Operations Platform</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
                id={`nav-${item.to.slice(1)}`}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-white/5 p-4">
          {!collapsed && user && (
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                user.role === 'asset_manager' ? 'bg-violet-500/20 text-violet-400'
                : user.role === 'property_manager' ? 'bg-cre-500/20 text-cre-400'
                : user.role === 'vendor' ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-[10px] text-gray-500">{ROLE_LABELS[user.role]}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              id="toggle-sidebar"
            >
              {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
            {!collapsed && (
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                id="logout-button"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content - Added relative/z-10 */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
