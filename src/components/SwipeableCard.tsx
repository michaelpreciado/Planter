'use client';

import React, { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Plant } from '@/lib/plant-store';

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
  const [dragX, setDragX] = useState(0);
  const controls = useAnimation();

  // Only enable swipe functionality on client side and if not disabled
  if (typeof window === 'undefined' || disabled) {
    return <div className="relative">{children}</div>;
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    try {
      const threshold = 100;
      const { offset, velocity } = info;

      if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
        if (offset.x > 0 && onSwipeRight) {
          // Swiped right
          controls.start({ x: 300, opacity: 0 });
          setTimeout(() => {
            onSwipeRight();
            controls.set({ x: 0, opacity: 1 });
          }, 200);
        } else if (offset.x < 0 && onSwipeLeft) {
          // Swiped left
          controls.start({ x: -300, opacity: 0 });
          setTimeout(() => {
            onSwipeLeft();
            controls.set({ x: 0, opacity: 1 });
          }, 200);
        } else {
          // Snap back
          controls.start({ x: 0 });
        }
      } else {
        // Snap back
        controls.start({ x: 0 });
      }
      setDragX(0);
    } catch (error) {
      console.warn('Error handling drag end:', error);
      setDragX(0);
    }
  };

  const getBackgroundColor = () => {
    if (dragX > 50 && rightAction) {
      return rightAction.color;
    } else if (dragX < -50 && leftAction) {
      return leftAction.color;
    }
    return 'transparent';
  };

  const getActionOpacity = () => {
    return Math.min(Math.abs(dragX) / 100, 1);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background Actions */}
      <div 
        className="absolute inset-0 flex items-center justify-between px-6 rounded-xl transition-colors duration-200"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {/* Right Action (when swiping right) */}
        {rightAction && (
          <motion.div 
            className="flex items-center gap-2 text-white"
            style={{ opacity: dragX > 0 ? getActionOpacity() : 0 }}
          >
            {rightAction.icon}
            <span className="font-medium">{rightAction.label}</span>
          </motion.div>
        )}
        
        <div className="flex-1" />
        
        {/* Left Action (when swiping left) */}
        {leftAction && (
          <motion.div 
            className="flex items-center gap-2 text-white"
            style={{ opacity: dragX < 0 ? getActionOpacity() : 0 }}
          >
            <span className="font-medium">{leftAction.label}</span>
            {leftAction.icon}
          </motion.div>
        )}
      </div>

      {/* Main Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.1}
        animate={controls}
        onDrag={(event, info) => {
          try {
            setDragX(info.offset.x);
          } catch (error) {
            console.warn('Error during drag:', error);
          }
        }}
        onDragEnd={handleDragEnd}
        className="relative bg-white rounded-xl cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
} 