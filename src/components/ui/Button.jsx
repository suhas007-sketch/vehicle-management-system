import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryDark hover:shadow-glow",
    secondary: "bg-surface text-textMain hover:bg-surface/80 border border-border",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-textMuted hover:text-textMain hover:bg-surface",
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
