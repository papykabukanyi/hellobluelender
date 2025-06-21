'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from './animations';

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
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}
