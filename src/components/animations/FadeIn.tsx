'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  once = true,
  margin = '0px',
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any });
  
  // Direction-based animations
  let initialY = 0;
  let initialX = 0;
  
  switch (direction) {
    case 'up':
      initialY = 40;
      break;
    case 'down':
      initialY = -40;
      break;
    case 'left':
      initialX = 40;
      break;
    case 'right':
      initialX = -40;
      break;
    default:
      initialY = 0;
      initialX = 0;
  }

  // Create variants for our animation
  const variants = {
    hidden: { 
      opacity: 0,
      y: initialY,
      x: initialX
    },
    visible: { 
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut" as any,
      }
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
