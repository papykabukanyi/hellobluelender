# UI Animation Enhancement Plan

## Overview

This document outlines the UI animation strategy for Hempire Enterprise to create a more engaging, modern, and interactive user experience focused on the hemp industry theme.

## Design Goals

- Create a professional yet engaging experience for business loan applicants
- Use subtle animations that enforce the "growth" theme of the hemp industry
- Ensure animations enhance rather than distract from the core functionality
- Maintain accessibility standards while adding interactive elements

## Color Palette

- Primary Green: #1F7832
- Secondary Green: #4CAF50
- Accent Green: #8BC34A
- Earth Tone: #795548
- Off-white: #F9F9F9
- Dark Green: #0B3C17

## Typography Animations

1. Header Animation

```javascript
// src/components/AnimatedHeader.js
import { motion } from "framer-motion";

export default function AnimatedHeader({ children }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-4xl font-bold text-green-800"
    >
      {children}
    </motion.h1>
  );
}
```

2. Text Reveal Animation

```javascript
// src/components/RevealText.js
import { motion } from "framer-motion";

export default function RevealText({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

## UI Element Animations

### Buttons

```javascript
// src/components/GrowButton.js
import { motion } from "framer-motion";

export default function GrowButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#0B3C17" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-green-700 text-white rounded-lg px-6 py-3 font-medium"
    >
      {children}
    </motion.button>
  );
}
```

### Cards

```javascript
// src/components/AnimatedCard.js
import { motion } from "framer-motion";

export default function AnimatedCard({ title, description, icon }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-green-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
```

## Page-Specific Animations

### Homepage

1. Hero Section Animation

```javascript
// src/components/HeroSection.js
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HeroSection() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="hero-section bg-gradient-to-r from-green-900 to-green-700 text-white py-20"
    >
      <div className="container mx-auto px-4">
        <motion.h1 variants={itemVariants} className="text-5xl font-bold mb-6">
          Grow Your Hemp Business with Custom Financing Solutions
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl mb-8">
          Fast approvals, competitive rates, and industry expertise
        </motion.p>
        <motion.div variants={itemVariants}>
          <a href="/application" className="btn-primary text-xl">
            Apply Now
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
```

2. Growing Plant Animation

```javascript
// src/components/GrowingPlantAnimation.js
import { motion } from "framer-motion";
import Image from "next/image";

export default function GrowingPlantAnimation() {
  return (
    <div className="relative h-64 w-full overflow-hidden">
      <motion.div
        initial={{ height: "0%", bottom: 0 }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-green-800"
      />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src="/images/hemp-leaf.svg" 
          alt="Hemp leaf" 
          width={120}
          height={120}
        />
      </motion.div>
    </div>
  );
}
```

### Application Form

1. Multi-step Form Animation

```javascript
// src/components/ApplicationForm/StepTransition.js
import { motion, AnimatePresence } from "framer-motion";

export default function StepTransition({ children, direction, currentStep }) {
  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: direction === 'next' ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction === 'next' ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

2. Progress Bar Animation

```javascript
// src/components/ApplicationForm/ProgressBar.js
import { motion } from "framer-motion";

export default function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="h-full bg-gradient-to-r from-green-700 to-green-500"
      />
    </div>
  );
}
```

### Success Page Animation

```javascript
// src/components/SuccessAnimation.js
import { motion } from "framer-motion";
import { CheckCircle } from "react-feather";

export default function SuccessAnimation() {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="inline-block"
      >
        <CheckCircle className="text-green-600 w-24 h-24 mx-auto" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold mt-6"
      >
        Application Submitted Successfully!
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-gray-600"
      >
        <p className="mb-2">Your application ID: <span className="font-bold">#123456</span></p>
        <p>We'll be in touch within 24-48 hours.</p>
      </motion.div>
    </div>
  );
}
```

## Scroll-based Animations

```javascript
// src/components/ScrollAnimations.js
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export function FadeInUpOnScroll({ children, delay = 0 }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StatsCounter({ value, label }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  return (
    <motion.div ref={ref} className="text-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        className="text-4xl font-bold text-green-700"
      >
        <CountUp end={value} duration={2} />
      </motion.div>
      <div className="text-lg text-gray-600">{label}</div>
    </motion.div>
  );
}
```

## Animation Dependencies

To implement these animations, add the following packages:

```bash
npm install framer-motion react-intersection-observer react-countup
```

## Browser Compatibility

Ensure animations work properly across:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Considerations

1. Use `willChange` property for complex animations
2. Reduce animation intensity on mobile devices
3. Respect user preferences with `prefers-reduced-motion` media query
4. Monitor Core Web Vitals metrics to ensure animations don't impact performance

## Implementation Roadmap

1. Set up animation dependencies and utility components (1 week)
2. Implement homepage animations (1 week)
3. Add application form animations (1-2 weeks)
4. Create success/confirmation page animations (1 week)
5. Test and optimize for performance (1 week)

## Accessibility

Ensure all animations:
1. Respect `prefers-reduced-motion` settings
2. Don't interfere with screen readers
3. Have appropriate focus states for keyboard navigation
4. Don't auto-play or loop indefinitely

```javascript
// src/hooks/useReducedMotion.js
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReducedMotion;
}
```
