'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GrowingLeafProps {
  className?: string;
  fillColor?: string;
  size?: number;
  delay?: number;
  duration?: number;
}

export default function GrowingLeaf({
  className = '',
  fillColor = 'var(--color-primary)',
  size = 100,
  delay = 0,
  duration = 1,
}: GrowingLeafProps) {
  const leafVariants = {
    hidden: { 
      pathLength: 0, 
      opacity: 0, 
      scale: 0.5,
      rotate: -10,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        pathLength: { 
          type: "spring",
          duration: duration * 1.2,
          delay,
          bounce: 0 
        },
        opacity: { 
          duration: duration * 0.8, 
          delay 
        },
        scale: { 
          type: "spring",
          duration: duration,
          delay: delay + 0.2,
          stiffness: 100,
          damping: 15 
        },          rotate: {
          duration: duration * 0.8,
          delay: delay + 0.1
        }
      }
    }
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <motion.svg 
        width="100%"
        height="100%"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M416 128c-18.9 0-36.3 6.2-50.4 16.9L338.5 96.4C361.9 75.9 384 49.1 384 0h-64c0 22.4-7.2 42.8-19.4 59.5L263.8 92.3C213.9 45.7 144.2 32 64 32v64c72.6 0 132.2 14.1 172.6 47.5-20.9 33.4-33.9 71.3-38.2 110.5h54.4c4-33.8 18.6-64.8 41.2-88.3L340.2 217c-12.3 25.9-19.2 54.8-19.2 85h64c0-40 18.1-75.8 46.6-99.7 14.1 10.7 31.5 16.7 50.4 16.7v-64c-19.6 0-37.3-7.3-50.9-19.4-12.3-11-20.2-26.3-22.7-43.7 26.7 4.2 50.3 18.8 66.4 39.1l33.9-48.4C485.2 36.1 438.9 0 384 0h-64v32c0 35.3 28.7 64 64 64 2.8 0 5.6-.2 8.3-.5-2.5 7.2-6.5 13.6-11.6 19-2.9 3-6.1 5.8-9.8 8.1-6.4 4.1-13.8 6.5-21.8 6.5v64c25.6 0 49.1-8.7 67.9-23.4 18.4-14.3 32.5-34.4 39.8-57.5 38.3 19.5 64.5 59.2 64.5 104.9h64c0-96.5-78.3-174.7-174.7-174.7L416 128z"
          fill={fillColor}
          stroke="none"
          strokeWidth={2}
          variants={leafVariants}
        />
      </motion.svg>
    </motion.div>
  );
}
