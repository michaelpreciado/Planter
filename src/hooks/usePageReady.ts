'use client';

import { useState, useEffect } from 'react';
import { usePlants } from '@/lib/plant-store';

interface UsePageReadyOptions {
  requiresAuth?: boolean;
  requiresPlants?: boolean;
  minLoadingTime?: number; // Minimum loading time to prevent flashing
}

export function usePageReady(options: UsePageReadyOptions = {}) {
  const { 
    requiresAuth = false, 
    requiresPlants = false, 
    minLoadingTime = 500 
  } = options;
  
  const { hasHydrated, loading: plantsLoading } = usePlants();
  const [isReady, setIsReady] = useState(false);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Set minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  useEffect(() => {
    // Check all conditions for page readiness
    const checkReadiness = () => {
      // Basic hydration must be complete
      if (!hasHydrated) return false;
      
      // Minimum time must have elapsed to prevent flashing
      if (!hasMinTimeElapsed) return false;
      
      // If plants are required, wait for plants to load
      if (requiresPlants && plantsLoading) return false;
      
      // All conditions met
      return true;
    };

    const ready = checkReadiness();
    if (ready && !isReady) {
      // Add a small delay for smooth transition
      const transitionDelay = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(transitionDelay);
    }
  }, [hasHydrated, hasMinTimeElapsed, plantsLoading, requiresPlants, isReady]);

  return {
    isReady,
    isLoading: !isReady,
    hasHydrated,
    plantsLoading
  };
}

// Utility hook for pages that need plants data
export function usePageWithPlants(minLoadingTime = 500) {
  return usePageReady({ 
    requiresPlants: true, 
    minLoadingTime 
  });
}

// Utility hook for simple pages
export function usePageBasic(minLoadingTime = 300) {
  return usePageReady({ 
    minLoadingTime 
  });
} 