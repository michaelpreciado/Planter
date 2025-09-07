'use client';

import React from 'react';
import { AnimatedButton } from '@/components/AnimationReplacements';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-provider';
import { useHapticFeedback } from '@/hooks/useMobileGestures';

interface NightModeToggleProps {
  className?: string;
}

export function NightModeToggle({ className = '' }: NightModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const haptic = useHapticFeedback();
  
  const isDarkMode = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
    haptic.lightImpact();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`p-2 rounded-full bg-white/40 backdrop-blur border border-white/20 shadow-lg hover:bg-white/50 transition-colors dark:bg-gray-800/40 dark:border-white/20 dark:hover:bg-gray-800/50 ${className}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDarkMode ? 180 : 0,
          scale: isDarkMode ? 1.1 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-6 h-6"
      >
        {/* Sun Icon */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
          animate={{ 
            opacity: isDarkMode ? 0 : 1,
            scale: isDarkMode ? 0.5 : 1,
            rotate: isDarkMode ? 90 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </motion.svg>

        {/* Moon Icon */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-indigo-400"
          fill="currentColor"
          viewBox="0 0 24 24"
          animate={{ 
            opacity: isDarkMode ? 1 : 0,
            scale: isDarkMode ? 1 : 0.5,
            rotate: isDarkMode ? 0 : -90
          }}
          transition={{ duration: 0.3 }}
        >
          <path 
            fillRule="evenodd" 
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" 
            clipRule="evenodd" 
          />
        </motion.svg>
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDarkMode 
            ? '0 0 20px rgba(99, 102, 241, 0.3)' 
            : '0 0 20px rgba(251, 191, 36, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
} 