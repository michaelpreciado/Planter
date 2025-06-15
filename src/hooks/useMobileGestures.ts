'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SwipeGestureOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useMobileGestures(options: SwipeGestureOptions = {}) {
  // Swipe gestures disabled - users must use buttons for navigation
  console.warn('Swipe gestures have been disabled. Please use buttons for navigation.');
  return null;
}

export function useHapticFeedback() {
  const vibrate = (pattern: number | number[]) => {
    // Only run on client side and if vibrate is supported
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  };

  const lightImpact = () => vibrate(10);
  const mediumImpact = () => vibrate(20);
  const heavyImpact = () => vibrate(30);
  const success = () => vibrate([10, 50, 10]);
  const error = () => vibrate([50, 100, 50]);
  const warning = () => vibrate([20, 50, 20]);

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
    success,
    error,
    warning,
  };
}

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  // Pull to refresh disabled - users must use buttons for refresh
  console.warn('Pull to refresh has been disabled. Please use buttons for refresh.');
  
  const containerRef = useRef<HTMLDivElement>(null);
  return {
    containerRef,
    isRefreshing: false,
    pullDistance: 0,
    pullProgress: 0,
  };
} 