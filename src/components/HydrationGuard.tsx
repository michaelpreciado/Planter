'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HydrationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function HydrationGuard({ 
  children, 
  fallback,
  delay = 100 
}: HydrationGuardProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isHydrated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <motion.div
            className="w-12 h-12 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg 
              className="w-full h-full text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            Loading...
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 