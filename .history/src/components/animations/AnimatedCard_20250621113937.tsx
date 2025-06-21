'use client';

import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function AnimatedCard({
  children,
  className = '',
  hoverEffect = true,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      whileHover={
        hoverEffect
          ? {
              y: -8,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
}
