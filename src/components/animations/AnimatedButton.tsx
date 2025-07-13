'use client';

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
    baseClasses += ' bg-primary text-white hover:bg-primary-dark focus:ring-primary-light';
  } else if (variant === 'secondary') {
    baseClasses += ' bg-primary-light text-primary hover:bg-primary-lighter focus:ring-primary-light';
  } else if (variant === 'outline') {
    baseClasses += ' bg-transparent border-2 border-primary text-primary hover:bg-primary-light focus:ring-primary-light';
  }
  
  if (disabled) {
    baseClasses += ' opacity-50 cursor-not-allowed';
  }
  
  // Combine with any custom classes passed in
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      type={type}
      disabled={disabled}
      style={{
        transform: 'scale(1)',
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
    >
      {children}
    </button>
  );
}
