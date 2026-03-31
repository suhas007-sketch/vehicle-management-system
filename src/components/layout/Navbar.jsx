import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Navbar() {
  return (
    <header className="h-20 glass border-b border-border sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search vehicles, bookings, customers..." 
            className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-textMuted/70"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 ml-4">
        <button className="relative p-2 rounded-full hover:bg-surface text-textMuted hover:text-textMain transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-glow"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-textMain group-hover:text-primary transition-colors">Admin User</span>
            <span className="text-xs text-textMuted">Manager</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shadow-glowAccent">
            <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-textMain" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
