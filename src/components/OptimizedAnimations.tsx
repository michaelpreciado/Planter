'use client';

import React from 'react';
import { memo } from 'react';

// Lightweight animation components using CSS instead of framer-motion
// This reduces bundle size by ~120kB

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn = memo(({ children, delay = 0, className = '' }: FadeInProps) => (
  <div 
    className={`animate-fade-in ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const SlideUp = memo(({ children, delay = 0, className = '' }: SlideUpProps) => (
  <div 
    className={`animate-slide-up ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
}

export const ScaleIn = memo(({ children, className = '' }: ScaleInProps) => (
  <div className={`hover:scale-105 transition-transform duration-200 ease-out ${className}`}>
    {children}
  </div>
));

// Optimized loading spinner with pure CSS
export const Spinner = memo(() => (
  <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
));

// Pulse animation for skeleton loaders
export const Pulse = memo(({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse-slow bg-gray-200 dark:bg-gray-700 ${className}`} />
));

// Staggered children animation
interface StaggeredChildrenProps {
  children: React.ReactNode;
  delay?: number;
}

export const StaggeredChildren = memo(({ children, delay = 0.1 }: StaggeredChildrenProps) => (
  <>
    {React.Children.map(children, (child, index) => (
      <div
        key={index}
        className="animate-fade-in"
        style={{
          animationDelay: `${index * delay}s`,
          animationFillMode: 'both'
        }}
      >
        {child}
      </div>
    ))}
  </>
));

// Export display names for debugging
FadeIn.displayName = 'FadeIn';
SlideUp.displayName = 'SlideUp';
ScaleIn.displayName = 'ScaleIn';
Spinner.displayName = 'Spinner';
Pulse.displayName = 'Pulse';
StaggeredChildren.displayName = 'StaggeredChildren'; 