import React, { useState } from 'react';
import { CameraOff } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ImageWithFallback - Gracefully handles broken image URLs by showing a placeholder.
 */
export const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className={cn("relative overflow-hidden bg-surface/50", className)}>
      {loading && !error && (
        <div className="absolute inset-0 animate-pulse bg-surface-light/20 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface/80 text-textMuted group">
          <CameraOff className="w-10 h-10 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Image Unavailable</span>
        </div>
      ) : (
        <img
          src={src || fallbackImage}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            loading ? "opacity-0 scale-110" : "opacity-100 scale-100"
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          {...props}
        />
      )}
    </div>
  );
};
