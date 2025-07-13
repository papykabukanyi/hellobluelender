'use client';

import { useRef, useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

export default function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  once = true,
  margin = '0px',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            setHasBeenVisible(true);
          }
        } else if (!once && !hasBeenVisible) {
          setIsVisible(false);
        }
      },
      { rootMargin: margin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [once, margin, hasBeenVisible]);

  // Direction-based styles
  let transformStyle = '';
  if (direction === 'up') {
    transformStyle = isVisible ? 'translateY(0)' : 'translateY(20px)';
  } else if (direction === 'down') {
    transformStyle = isVisible ? 'translateY(0)' : 'translateY(-20px)';
  } else if (direction === 'left') {
    transformStyle = isVisible ? 'translateX(0)' : 'translateX(20px)';
  } else if (direction === 'right') {
    transformStyle = isVisible ? 'translateX(0)' : 'translateX(-20px)';
  } else {
    transformStyle = 'translate(0)';
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: transformStyle,
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
