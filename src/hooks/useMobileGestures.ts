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
  const {
    threshold = 100,
    velocityThreshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        startTime.current = Date.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startX.current;
        const deltaY = touch.clientY - startY.current;
        const deltaTime = Date.now() - startTime.current;
        
        // Prevent division by zero
        if (deltaTime === 0) return;
        
        const velocityX = Math.abs(deltaX) / deltaTime;
        const velocityY = Math.abs(deltaY) / deltaTime;

        // Check if gesture meets threshold requirements
        if (Math.abs(deltaX) > threshold || velocityX > velocityThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }

        if (Math.abs(deltaY) > threshold || velocityY > velocityThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    };

    try {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    } catch (error) {
      console.warn('Error setting up mobile gestures:', error);
      return () => {};
    }
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0 && e.touches.length > 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0 && startY.current > 0 && e.touches.length > 0) {
        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY.current);
        setPullDistance(Math.min(distance, 100));
        
        if (distance > 0) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.warn('Pull to refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      startY.current = 0;
    };

    try {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    } catch (error) {
      console.warn('Error setting up pull to refresh:', error);
      return () => {};
    }
  }, [onRefresh, pullDistance, isRefreshing]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / 60, 1),
  };
} 