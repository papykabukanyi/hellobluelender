'use client';

import { motion } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';

interface ScrollTriggeredAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'scaleUp' | 'growPlant' | 'highlight' | 'pulse';
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function ScrollTriggeredAnimation({
  children,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
}: ScrollTriggeredAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  // Define animation variants
  let variants = {};
  
  switch (animation) {
    case 'fadeIn':
      variants = {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }
        }
      };
      break;
      
    case 'slideUp':
      variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }
        }
      };
      break;
      
    case 'scaleUp':
      variants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: {
            duration,
            delay,
            ease: [0.34, 1.56, 0.64, 1],
          }
        }
      };
      break;
      
    case 'growPlant':
      variants = {
        hidden: { opacity: 0, scale: 0.5, y: 50 },
        visible: { 
          opacity: 1, 
          scale: 1,
          y: 0,
          transition: {
            duration: duration * 1.5,
            delay,
            ease: "backOut",
          }
        }
      };
      break;
      
    case 'highlight':
      variants = {
        hidden: { opacity: 1, backgroundColor: 'rgba(31, 120, 50, 0)' },
        visible: { 
          opacity: 1, 
          backgroundColor: ['rgba(31, 120, 50, 0)', 'rgba(31, 120, 50, 0.1)', 'rgba(31, 120, 50, 0)'],
          transition: {
            duration: duration * 2,
            delay,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }
        }
      };
      break;
      
    case 'pulse':
      variants = {
        hidden: { scale: 1 },
        visible: { 
          scale: [1, 1.05, 1],
          transition: {
            duration: duration,
            delay,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2,
          }
        }
      };
      break;
      
    default:
      variants = {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: {
            duration,
            delay,
          }
        }
      };
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
