'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export default function Parallax({
  children,
  speed = 0.2,
  className = '',
  direction = 'up',
}: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Adjust transform based on direction
  let transform;

  switch (direction) {
    case 'up':
      transform = useTransform(scrollYProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    case 'down':
      transform = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
    case 'left':
      transform = useTransform(scrollYProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    case 'right':
      transform = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
    default:
      transform = useTransform(scrollYProgress, [0, 1], ['0%', `-${speed * 100}%`]);
  }

  const style = direction === 'left' || direction === 'right'
    ? { x: transform }
    : { y: transform };

  return (
    <motion.div ref={ref} style={style} className={className}>
      {children}
    </motion.div>
  );
}
