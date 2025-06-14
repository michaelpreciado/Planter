'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OptimizedPageTransitionProps {
  children: React.ReactNode;
}

export function OptimizedPageTransition({ children }: OptimizedPageTransitionProps) {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Reduced variants for accessibility
  const reducedVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Full animation variants
  const fullVariants: Variants = {
    initial: { 
      opacity: 0, 
      y: 8,
      scale: 0.99
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -8,
      scale: 1.01,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const variants = prefersReducedMotion ? reducedVariants : fullVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen flex flex-col bg-background will-change-transform"
        style={{
          // Prevent layout shift during transitions
          contain: 'layout style paint',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 