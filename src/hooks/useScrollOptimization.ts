import { useEffect, useRef, useCallback } from 'react';

interface ScrollOptimizationOptions {
  enableMomentum?: boolean;
  enableSmoothScroll?: boolean;
  enablePerformanceOptimizations?: boolean;
  scrollSnapType?: 'none' | 'x' | 'y' | 'both';
  overscrollBehavior?: 'auto' | 'contain' | 'none';
}

export function useScrollOptimization(options: ScrollOptimizationOptions = {}) {
  const {
    enableMomentum = true,
    enableSmoothScroll = true,
    enablePerformanceOptimizations = true,
    scrollSnapType = 'none',
    overscrollBehavior = 'contain'
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Apply scroll optimizations
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Base mobile scroll optimizations
    const baseStyles: Record<string, string> = {
      scrollBehavior: enableSmoothScroll ? 'smooth' : 'auto',
      overscrollBehavior: overscrollBehavior,
    };

    // Performance optimizations
    if (enablePerformanceOptimizations) {
      Object.assign(baseStyles, {
        willChange: 'scroll-position',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      });
    }

    // Momentum scrolling
    if (enableMomentum) {
      baseStyles['-webkit-overflow-scrolling'] = 'touch';
    }

    // Scroll snap
    if (scrollSnapType !== 'none') {
      const snapType = scrollSnapType === 'both' ? 'both proximity' : 
                       scrollSnapType === 'x' ? 'x proximity' : 'y proximity';
      baseStyles.scrollSnapType = snapType;
    }

    // Apply styles
    Object.keys(baseStyles).forEach(key => {
      element.style.setProperty(key, baseStyles[key]);
    });

    return () => {
      // Cleanup - reset to defaults
      Object.keys(baseStyles).forEach(key => {
        element.style.removeProperty(key);
      });
    };
  }, [enableMomentum, enableSmoothScroll, enablePerformanceOptimizations, scrollSnapType, overscrollBehavior]);

  // Smooth scroll to top
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior
      });
    }
  }, []);

  // Smooth scroll to element
  const scrollToElement = useCallback((elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (element && scrollRef.current) {
      const elementTop = element.offsetTop - offset;
      scrollRef.current.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Smooth scroll by distance
  const scrollBy = useCallback((distance: number, behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: distance,
        behavior
      });
    }
  }, []);

  // Check if element is in viewport
  const isElementInViewport = useCallback((element: HTMLElement): boolean => {
    if (!scrollRef.current) return false;
    
    const rect = element.getBoundingClientRect();
    const containerRect = scrollRef.current.getBoundingClientRect();
    
    return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
    );
  }, []);

  // Scroll position utilities
  const getScrollPosition = useCallback(() => {
    if (!scrollRef.current) return { x: 0, y: 0 };
    return {
      x: scrollRef.current.scrollLeft,
      y: scrollRef.current.scrollTop
    };
  }, []);

  const isScrolledToBottom = useCallback(() => {
    if (!scrollRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return scrollTop + clientHeight >= scrollHeight - 5; // 5px threshold
  }, []);

  const isScrolledToTop = useCallback(() => {
    if (!scrollRef.current) return true;
    return scrollRef.current.scrollTop <= 5; // 5px threshold
  }, []);

  return {
    scrollRef,
    scrollToTop,
    scrollToElement,
    scrollBy,
    isElementInViewport,
    getScrollPosition,
    isScrolledToBottom,
    isScrolledToTop,
  };
}

// Hook for horizontal scrolling optimization
export function useHorizontalScrollOptimization() {
  return useScrollOptimization({
    scrollSnapType: 'x',
    overscrollBehavior: 'contain'
  });
}

// Hook for vertical scrolling optimization
export function useVerticalScrollOptimization() {
  return useScrollOptimization({
    scrollSnapType: 'y',
    overscrollBehavior: 'contain'
  });
}

// Hook for list/grid scrolling
export function useListScrollOptimization() {
  return useScrollOptimization({
    enableMomentum: true,
    enableSmoothScroll: true,
    enablePerformanceOptimizations: true,
    scrollSnapType: 'y',
    overscrollBehavior: 'contain'
  });
} 