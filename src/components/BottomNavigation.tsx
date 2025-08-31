'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useMobileGestures';

export function BottomNavigation() {
  const pathname = usePathname();
  const haptic = useHapticFeedback();
  const navRef = useRef<HTMLElement>(null);

  const handleNavClick = () => {
    haptic.lightImpact();
  };

  // Auto-detect and update nav height
  useEffect(() => {
    const updateNavHeight = () => {
      const navEl = navRef.current;
      if (!navEl) return;

      // Get the rendered height (including padding) and subtract bottom padding (safe-area inset)
      const computed = window.getComputedStyle(navEl);
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;
      const heightWithoutInset = navEl.offsetHeight - paddingBottom;

      // Fallback to default height if calculation fails
      const height = heightWithoutInset > 0 ? heightWithoutInset : 64;

      // Persist for the rest of the app
      document.documentElement.style.setProperty('--nav-height', `${height}px`);
    };
    
    updateNavHeight();
    
    // Update on resize to handle orientation changes
    window.addEventListener('resize', updateNavHeight);
    window.addEventListener('orientationchange', updateNavHeight);
    
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('orientationchange', updateNavHeight);
    };
  }, []);

  const navItems = [
    {
      href: '/list',
      label: 'Plants',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>
      )
    },
    {
      href: '/',
      label: 'Home',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      )
    },
    {
      href: '/add-plant',
      label: 'Add',
      icon: (isActive: boolean) => (
        <svg className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      )
    }
  ];

  return (
    <nav
      ref={navRef}
      className="bottom-nav-fixed h-auto min-h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-white/20 dark:border-white/10 safe-area-bottom"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingTop: '0.5rem',
        // Additional inline styles to ensure it stays fixed
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: '10000', // Higher z-index to ensure visibility
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        // Force visibility and prevent hidden
        visibility: 'visible',
        display: 'block',
        // Additional mobile fixes
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1 sm:py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              onClick={handleNavClick}
              className="relative flex flex-col items-center justify-center py-1 sm:py-2 px-2 sm:px-3 min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-1 w-1 h-1 bg-primary-500 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium leading-none ${
                isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 