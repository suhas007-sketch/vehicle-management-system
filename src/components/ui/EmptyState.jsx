import React from 'react';
import { Button } from './Button';
import { PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyState = ({ title, description, buttonText, onButtonClick, icon: Icon = PackageOpen }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center glass-card border-dashed border-border/50"
    >
      <div className="p-4 bg-surface rounded-full mb-4 border border-border">
        <Icon className="w-12 h-12 text-textMuted" />
      </div>
      <h3 className="text-xl font-bold text-textMain">{title}</h3>
      <p className="text-textMuted mt-2 max-w-sm">{description}</p>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick} className="mt-6">
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
};
