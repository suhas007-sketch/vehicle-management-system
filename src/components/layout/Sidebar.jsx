import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Car, CalendarCheck, Users, Settings, LogOut, Zap, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Vehicles', path: '/app/vehicles', icon: Car },
  { name: 'Bookings', path: '/app/bookings', icon: CalendarCheck },
  { name: 'Customers', path: '/app/customers', icon: Users },
  { name: 'Maintenance', path: '/app/maintenance', icon: Wrench },
  { name: 'Settings', path: '/app/settings', icon: Settings },
];


export default function Sidebar() {
  const { logout } = useContext(AuthContext);
  
  return (
    <div className="w-64 h-screen glass border-r border-border fixed left-0 top-0 flex flex-col hidden md:flex z-50">
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <Zap className="w-8 h-8 text-primary shadow-glow rounded-full" />
        <span className="ml-3 text-xl font-bold tracking-wider text-textMain">VRMS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-3 rounded-lg transition-all duration-300 group relative",
              isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-textMuted hover:text-textMain hover:bg-surface"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-md shadow-glow" 
                  />
                )}
                <item.icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-primary" : "group-hover:text-textMain")} />
                <span className="font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border/50">
        <button onClick={logout} className="flex items-center px-4 py-3 w-full text-textMuted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
