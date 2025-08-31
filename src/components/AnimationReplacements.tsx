'use client';

import React, { memo, useEffect, useState } from 'react';

// Lightweight animation components using CSS instead of framer-motion
// Saves ~120kB from bundle

interface BaseAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

// Optimized CSS animations
export const FadeIn = memo(({ children, delay = 0, duration = 0.3, className = '' }: BaseAnimationProps) => (
  <div 
    className={`animate-fade-in ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

export const SlideUp = memo(({ children, delay = 0, duration = 0.3, className = '' }: BaseAnimationProps) => (
  <div 
    className={`animate-slide-up ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

export const SlideDown = memo(({ children, delay = 0, duration = 0.3, className = '' }: BaseAnimationProps) => (
  <div 
    className={`animate-slide-down ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

export const ScaleIn = memo(({ children, delay = 0, duration = 0.2, className = '' }: BaseAnimationProps) => (
  <div 
    className={`animate-scale-in ${className}`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
));

// Modal/Overlay animations
export const ModalBackdrop = memo(({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[10000] transition-all duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`
        absolute inset-0 flex items-center justify-center p-4
        transition-all duration-200 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {children}
      </div>
    </div>
  );
});

// Page transition replacement
export const PageTransition = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="animate-page-enter min-h-screen flex flex-col bg-background">
      {children}
    </div>
  );
});

// Staggered children animation
export const StaggerContainer = memo(({ children, staggerDelay = 0.1 }: { children: React.ReactNode; staggerDelay?: number }) => (
  <div className="stagger-container" style={{ '--stagger-delay': `${staggerDelay}s` } as React.CSSProperties}>
    {React.Children.map(children, (child, index) => (
      <div
        key={index}
        className="stagger-item"
        style={{ animationDelay: `${index * staggerDelay}s` }}
      >
        {child}
      </div>
    ))}
  </div>
));

// Button with micro-interactions
export const AnimatedButton = memo(({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  [key: string]: any;
}) => (
  <button
    className={`
      btn-animated btn-${variant} ${className}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
));

// Loading spinner
export const Spinner = memo(({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }[size];

  return (
    <div className={`${sizeClass} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  );
});

// Bottom sheet animation
export const BottomSheet = memo(({ 
  children, 
  isOpen, 
  onClose 
}: { 
  children: React.ReactNode; 
  isOpen: boolean; 
  onClose: () => void 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div className={`
        absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 
        rounded-t-2xl transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {children}
      </div>
    </div>
  );
});

// Add display names for debugging
FadeIn.displayName = 'FadeIn';
SlideUp.displayName = 'SlideUp';
SlideDown.displayName = 'SlideDown';
ScaleIn.displayName = 'ScaleIn';
ModalBackdrop.displayName = 'ModalBackdrop';
PageTransition.displayName = 'PageTransition';
StaggerContainer.displayName = 'StaggerContainer';
AnimatedButton.displayName = 'AnimatedButton';
Spinner.displayName = 'Spinner';
BottomSheet.displayName = 'BottomSheet'; 