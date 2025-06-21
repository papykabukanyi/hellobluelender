'use client';

import { motion } from 'framer-motion';

interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerAmount?: number;
}

export default function StaggeredContainer({
  children,
  className = '',
  delay = 0.2,
  staggerAmount = 0.1,
}: StaggeredContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerAmount,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    },
  };

  // Clone children and wrap them with motion.div with item variants
  const staggeredChildren = React.Children.map(children, (child) => {
    return <motion.div variants={itemVariants}>{child}</motion.div>;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className={className}
    >
      {staggeredChildren}
    </motion.div>
  );
}
