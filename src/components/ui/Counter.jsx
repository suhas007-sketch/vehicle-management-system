import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export const Counter = ({ from = 0, to, duration = 1, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: duration,
      onUpdate(value) {
        setCount(value);
      },
    });
    return () => controls.stop();
  }, [from, to, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  );
};
