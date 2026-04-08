import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils'; // Assuming cn exists, else I'll use simple class concat

export default function AsyncButton({ 
  children, 
  loading = false, 
  disabled = false, 
  icon: Icon,
  className,
  variant,
  size,
  ...props 
}) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden group transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex items-center justify-center gap-2 transition-transform duration-300",
        loading ? "opacity-0 scale-75 blur-sm" : "opacity-100 scale-100 blur-0"
      )}>
        {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
        <span className="font-extrabold italic uppercase tracking-wider">{children}</span>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, ease: "backOut" }}
              className="flex items-center gap-2"
            >
               <Loader2 className="w-5 h-5 animate-spin text-white" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Syncing...</span>
            </motion.div>
        </div>
      )}
    </Button>
  );
}
