'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
}: AnimatedButtonProps) {
  // Base styles
  let baseClasses = 'rounded-lg px-6 py-3 font-medium transition-all focus:outline-none focus:ring-2';
  
  // Apply variant-specific styling
  if (variant === 'primary') {
    baseClasses += ' bg-[#1F7832] text-white hover:bg-[#0B3C17] focus:ring-green-300';
  } else if (variant === 'secondary') {
    baseClasses += ' bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-200';
  } else if (variant === 'outline') {
    baseClasses += ' bg-transparent border-2 border-[#1F7832] text-[#1F7832] hover:bg-green-50 focus:ring-green-200';
  }
  
  if (disabled) {
    baseClasses += ' opacity-50 cursor-not-allowed';
  }
  
  // Combine with any custom classes passed in
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
