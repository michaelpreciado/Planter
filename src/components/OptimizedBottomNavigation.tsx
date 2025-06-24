'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  prefetch?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', icon: '🏠', label: 'Home', prefetch: true },
  { href: '/list', icon: '🌱', label: 'Plants', prefetch: true },
  { href: '/add-plant', icon: '➕', label: 'Add', prefetch: false },
  { href: '/settings', icon: '⚙️', label: 'Settings', prefetch: false },
];

export function OptimizedBottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.href === pathname);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [pathname]);

  const handleNavClick = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
  };

  const handleTouchStart = (href: string) => {
    // Prefetch on touch start for instant navigation
    router.prefetch(href);
  };

  const animationVariants = prefersReducedMotion ? {
    active: { scale: 1 },
    inactive: { scale: 1 },
    indicator: { x: 0 }
  } : {
    active: { scale: 1.1 },
    inactive: { scale: 1 },
    indicator: { x: 0 }
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border-t border-white/10 dark:border-white/5 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="safe-area-inset-bottom">
        <div className="relative px-4 py-2">
          {/* Active indicator */}
          <motion.div
            className="absolute top-0 h-0.5 bg-primary rounded-full"
            style={{
              width: `${100 / navItems.length}%`,
            }}
            animate={{
              x: `${activeIndex * 100}%`,
            }}
            transition={prefersReducedMotion ? { duration: 0 } : {
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          />
          
          <div className="flex items-center justify-around">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={item.prefetch}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href, index);
                  }}
                  onTouchStart={() => handleTouchStart(item.href)}
                  className="flex flex-col items-center justify-center py-2 px-3 min-w-[60px] touch-manipulation"
                >
                  <motion.div
                    className="flex flex-col items-center"
                    variants={animationVariants}
                    animate={isActive ? "active" : "inactive"}
                    transition={prefersReducedMotion ? { duration: 0 } : {
                      type: "spring",
                      stiffness: 400,
                      damping: 20
                    }}
                  >
                    <motion.span 
                      className="text-xl mb-1"
                      animate={{
                        filter: isActive 
                          ? 'drop-shadow(0 0 8px rgba(94, 177, 94, 0.6))' 
                          : 'none'
                      }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.span>
                    
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isActive ? 'active' : 'inactive'}
                        className={`text-xs font-medium transition-colors ${
                          isActive 
                            ? 'text-primary' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 