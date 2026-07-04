import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Bell,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'citizen'] },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle, roles: ['admin', 'citizen'] },
  { path: '/map', label: 'Map View', icon: Map, roles: ['admin', 'citizen'] },
  { path: '/alerts', label: 'Alerts', icon: Bell, roles: ['admin', 'citizen'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  { path: '/profile', label: 'Profile', icon: Settings, roles: ['admin', 'citizen'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      <motion.aside
        initial={{ width: collapsed ? 72 : 256 }}
        animate={{ width: collapsed ? 72 : 256 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-gray-950/90 backdrop-blur-xl border-r border-gray-800/50 z-40 overflow-visible group"
      >
        <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800/50 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-lg gradient-text whitespace-nowrap">
              UrbanShield
            </motion.span>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm whitespace-nowrap">Sign Out</span>}
          </button>
        </div>

        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-20 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-cyan/50 transition-all shadow-lg z-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        </motion.aside>

      <MobileNav filteredItems={filteredItems} user={user} logout={logout} />
    </>
  );
}

function MobileNav({ filteredItems, user, logout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="glass border-t border-gray-800/50 px-2 py-1 flex items-center justify-around">
        {filteredItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-neon-cyan' : 'text-gray-500'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
        <button onClick={() => setOpen(!open)} className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-500">
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="glass border-t border-gray-800/50 p-2 grid grid-cols-4 gap-1"
          >
            {filteredItems.slice(4).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors',
                    isActive ? 'text-neon-cyan' : 'text-gray-500'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
