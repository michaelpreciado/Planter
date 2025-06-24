'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useMobileGestures';

export function BottomNavigation() {
  const pathname = usePathname();
  const haptic = useHapticFeedback();

  const handleNavClick = () => {
    haptic.lightImpact();
  };

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
      className="fixed bottom-0 left-0 right-0 bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl border-t border-white/20 dark:border-white/10 z-50 safe-area-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
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