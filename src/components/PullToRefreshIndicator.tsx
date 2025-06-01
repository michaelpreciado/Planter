'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PullToRefreshIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  pullDistance: number;
}

export function PullToRefreshIndicator({ 
  progress, 
  isRefreshing, 
  pullDistance 
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center"
      style={{ 
        height: Math.max(pullDistance, isRefreshing ? 80 : 0),
        marginTop: -80 
      }}
      animate={{ opacity: pullDistance > 0 || isRefreshing ? 1 : 0 }}
    >
      <div className="flex flex-col items-center justify-end h-full pb-4">
        {isRefreshing ? (
          // Refreshing Animation
          <motion.div
            className="flex items-center gap-2 text-green-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-6 h-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <span className="text-sm font-medium">Refreshing...</span>
          </motion.div>
        ) : (
          // Pull Progress
          <div className="flex flex-col items-center gap-2">
            {/* Plant Icon with Growth Animation */}
            <motion.div
              className="relative"
              animate={{ 
                scale: 0.8 + (progress * 0.4),
                rotate: progress * 10 
              }}
            >
              <div className="w-8 h-8 text-green-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z"/>
                </svg>
              </div>
              
              {/* Water droplets */}
              {progress > 0.3 && (
                <motion.div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: progress > 0.3 ? 1 : 0,
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    y: { duration: 1, repeat: Infinity },
                    opacity: { duration: 0.3 }
                  }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </motion.div>
              )}
            </motion.div>

            {/* Progress Circle */}
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 75.4" }}
                  animate={{ 
                    strokeDasharray: `${progress * 75.4} 75.4` 
                  }}
                  transition={{ duration: 0.2 }}
                />
              </svg>
            </div>

            {/* Pull Text */}
            <motion.p 
              className="text-xs text-gray-600 font-medium"
              animate={{ 
                opacity: pullDistance > 20 ? 1 : 0,
                y: pullDistance > 20 ? 0 : -10
              }}
            >
              {progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </motion.p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 