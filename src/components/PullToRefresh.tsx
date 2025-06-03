'use client';

import React, { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 100 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, threshold * 1.5));
    }
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Animate to refresh position
      await controls.start({ 
        y: threshold * 0.8,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      // Animate back to original position
      await controls.start({ 
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
      
      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      // Return to original position
      controls.start({ 
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
      setPullDistance(0);
    }
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance > threshold;

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          height: Math.max(pullDistance, 0),
          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.1), transparent)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <motion.div
            className="w-8 h-8 mb-2"
            animate={{ 
              rotate: isRefreshing ? 360 : refreshProgress * 360,
              scale: isRefreshing ? 1.1 : 0.8 + refreshProgress * 0.4
            }}
            transition={{
              rotate: isRefreshing ? {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              } : {
                duration: 0.2
              }
            }}
          >
            <svg
              className={`w-full h-full ${
                shouldTrigger ? 'text-green-600' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
          
          <motion.div
            className={`text-xs font-medium ${
              shouldTrigger ? 'text-green-600' : 'text-gray-500'
            }`}
            animate={{ opacity: pullDistance > 40 ? 1 : 0 }}
          >
            {isRefreshing 
              ? 'Refreshing...' 
              : shouldTrigger 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            className="w-16 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden"
            animate={{ opacity: pullDistance > 40 && !isRefreshing ? 1 : 0 }}
          >
            <motion.div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${refreshProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="will-change-transform"
        style={{
          touchAction: 'pan-y',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
} 