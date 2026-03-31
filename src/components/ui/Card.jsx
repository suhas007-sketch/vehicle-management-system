import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function Card({ className, children, hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -5, scale: 1.01 },
    transition: { type: "spring", stiffness: 300 }
  } : {};

  return (
    <Component 
      className={cn("glass-card overflow-hidden", hover && "hover:shadow-glow cursor-pointer border-primary/50", className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("p-6 pb-4", className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("text-xl font-semibold tracking-tight text-textMain", className)}>{children}</h3>;
}

export function CardContent({ className, children }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
