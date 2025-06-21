'use client';

import AnimatedButton from './AnimatedButton';
import AnimatedCard from './AnimatedCard';
import FadeIn from './FadeIn';
import Parallax from './Parallax';
import StaggeredContainer from './StaggeredContainer';
import ScrollTriggeredAnimation from './ScrollTriggeredAnimation';

// Import other animation component modules
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import PageTransition, { pageVariants } from './PageTransition';
import ProgressBar from './ProgressBar';
import GrowingLeaf from './GrowingLeaf';

// Export all animation components
export {
  AnimatedButton,
  AnimatedCard,
  FadeIn,
  Parallax,
  StaggeredContainer,
  ScrollTriggeredAnimation,
  PageTransition,
  ProgressBar,
  GrowingLeaf,
  AnimatedCounter,
  pageVariants
};
