'use client';

import AnimatedButton from './AnimatedButton';
import AnimatedCard from './AnimatedCard';
import FadeIn from './FadeIn';
import Parallax from './Parallax';
import StaggeredContainer from './StaggeredContainer';
import ScrollTriggeredAnimation from './ScrollTriggeredAnimation';

// Additional animation component - animated counter
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  from,
  to,
  duration = 1.5,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: '-100px' });
  
  useEffect(() => {
    if (!inView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Use easing function for more natural counting
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(from + (to - from) * easeOutQuart));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [from, to, duration, inView]);

  return (
    <motion.div
      ref={nodeRef}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.div>
  );
}

// Page transition effect
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Export a wrapper to use these transitions
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

// Progress bar animation - useful for steps/stages in application
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
  barColor = '#1F7832',
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

// Growing leaf animation component
export function GrowingLeaf({ className = '', size = 50 }) {
  return (
    <motion.div
      className={`text-[#1F7832] ${className}`}
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }}
      style={{ fontSize: size }}
    >
      🍃
    </motion.div>
  );
}

export {
  AnimatedButton,
  AnimatedCard,
  FadeIn,
  Parallax,
  StaggeredContainer,
};
