'use client';

import React from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  disabled = false
}: SwipeableCardProps) {
  // Swipe functionality disabled - users must use buttons instead
  console.warn('SwipeableCard swipe functionality has been disabled. Use regular buttons instead.');
  
  return (
    <div className="relative rounded-xl">
      {children}
    </div>
  );
} 