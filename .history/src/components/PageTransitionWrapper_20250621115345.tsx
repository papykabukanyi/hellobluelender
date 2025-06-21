'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Import motion from framer-motion
// Don't import pageVariants due to typing issues

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransitionWrapper({
  children,
  className = '',
}: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { 
          opacity: 0, 
          y: 20 
        },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.5, 
            ease: "easeOut" 
          }
        },
        exit: { 
          opacity: 0, 
          y: -20,
          transition: { 
            duration: 0.3 
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}
