import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-20 glass border-b border-border sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search fleet, bookings, customers..." 
            className="w-full bg-surface/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-textMuted/50 tracking-tight"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-textMuted opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 text-textMuted hover:text-primary transition-all duration-300 focus:outline-none group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-glow animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border/50 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-textMain group-hover:text-primary transition-colors">{user?.name || 'User'}</span>
            <span className="text-[10px] text-textMuted uppercase tracking-widest font-bold">{user?.role || 'Member'}</span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary font-bold shadow-inner group-hover:border-primary/50 transition-all overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background border-2 border-border rounded-full flex items-center justify-center">
              <ChevronDown className="w-2 h-2 text-textMuted" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
