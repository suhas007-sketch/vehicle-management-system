import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("skeleton bg-surface/50 rounded-md", className)}
      {...props}
    />
  );
};
