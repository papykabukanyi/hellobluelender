'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  barColor?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  className = '',
  barColor = 'var(--color-primary)',
  height = 8,
  animated = true,
}: ProgressBarProps) {
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: barColor, originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ 
          duration: animated ? 1 : 0,
          ease: "easeInOut" 
        }}
      />
    </div>
  );
}

export default ProgressBar;
