import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check, Trash2 } from 'lucide-react';
import { Button } from './Button';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action may be irreversible.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "danger",
  loading = false
}) {
  if (!isOpen) return null;

  const Icon = variant === 'danger' ? Trash2 : AlertCircle;
  const accentColor = variant === 'danger' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-primary bg-primary/10 border-primary/20';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-surface border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[32px] w-full max-w-md relative overflow-hidden"
        >
          {/* Header Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
          
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${accentColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-textMain tracking-tight uppercase italic">{title}</h2>
              <button 
                onClick={onClose} 
                className="ml-auto p-2 hover:bg-white/5 rounded-xl text-textMuted transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-textMuted leading-relaxed font-bold mb-8">
              {message}
            </p>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="flex-1 h-12 rounded-2xl"
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button 
                variant={variant === 'danger' ? 'destructive' : 'primary'} 
                onClick={onConfirm} 
                className="flex-1 h-12 rounded-2xl gap-2 shadow-glow"
                disabled={loading}
              >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <Check className="w-4 h-4" />
                )}
                <span className="font-extrabold italic uppercase tracking-wider">{confirmText}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
