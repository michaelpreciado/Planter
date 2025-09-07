'use client';

import { FadeIn, Spinner } from '@/components/AnimationReplacements';
import { motion } from 'framer-motion';

interface PageLoaderProps {
  message?: string;
  showProgress?: boolean;
}

export function PageLoader({ message = "Loading...", showProgress = false }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        {/* Animated Plant Icon */}
        <motion.div
          className="w-16 h-16 mx-auto relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="text-5xl"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🌱
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-medium text-foreground">
            {message}
          </h2>
          
          {/* Animated Dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar (Optional) */}
        {showProgress && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full bg-muted rounded-full h-1.5 overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}

        {/* Skeleton Content Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3 pt-4"
        >
          <div className="h-4 bg-muted rounded-lg w-3/4 mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-1/2 mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-2/3 mx-auto animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="top-header-fixed bg-transparent backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-4 pt-safe"
      style={{ 
        // Additional inline styles to ensure it stays fixed
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '9998',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.header>
  );
}

export function PageContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className={`flex-1 ${className}`}
    >
      {children}
    </motion.div>
  );
} 