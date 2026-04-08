import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Loader2 } from 'lucide-react';

export default function FullScreenLoader({ message = "Initializing Fleet Command...", isVisible = true }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background"
        >
          {/* Futuristic Background Element */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05),transparent_50%)]" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Branded Logo Container */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-full"
              />
              <div className="w-24 h-24 bg-surface border border-white/5 rounded-[32px] flex items-center justify-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <Car className="w-10 h-10 text-primary relative z-10" />
              </div>
            </div>

            {/* Branded Text */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-textMain">
                VRMS <span className="text-primary italic">OS</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted/60">
                Vehicle Rental Management System
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-bold text-textMuted uppercase tracking-widest animate-pulse">
                  {message}
                </span>
              </div>
              
              {/* Fake Progress Bar for Premium Feel */}
              <div className="w-48 h-1 bg-surface rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Footer Text */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.2em] text-textMuted/30">
            Powered by Supabase Engine 2026.0
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
