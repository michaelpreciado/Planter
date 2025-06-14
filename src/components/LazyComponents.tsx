'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy animation components
export const LazyTamagotchiBlob = dynamic(() => import('./TamagotchiBlob').then(mod => ({ default: mod.TamagotchiBlob })), {
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
  ),
  ssr: false
});

export const LazyWaterAnimation = dynamic(() => import('./WaterAnimation').then(mod => ({ default: mod.WaterAnimation })), {
  loading: () => null,
  ssr: false
});

export const LazyPullToRefresh = dynamic(() => import('./PullToRefresh').then(mod => ({ default: mod.PullToRefresh })), {
  loading: () => <div className="w-full h-full" />,
  ssr: false
});

// Optimized Image Capture with loading state
export const LazyImageCapture = dynamic(() => import('./ImageCapture').then(mod => ({ default: mod.ImageCapture })), {
  loading: () => (
    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading camera...</span>
    </div>
  ),
  ssr: false
});

// Skeleton component for loading states
export function PlantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 animate-pulse">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PlantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper component with suspense
export function SuspenseWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <PageSkeleton />}>
      {children}
    </Suspense>
  );
} 