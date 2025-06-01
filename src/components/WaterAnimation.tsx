'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function WaterAnimation({ isVisible, onComplete, size = 'medium' }: WaterAnimationProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 60, height: 60 };
      case 'large': return { width: 120, height: 120 };
      default: return { width: 80, height: 80 };
    }
  };

  const containerSize = getSize();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <svg
            width={containerSize.width}
            height={containerSize.height}
            viewBox="0 0 80 80"
            className="absolute"
          >
            {/* Main water droplets */}
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={`drop-${i}`}
                cx={40 + (i - 2.5) * 8}
                cy={20}
                r="3"
                fill="#4FC3F7"
                initial={{ 
                  cy: 20,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  cy: [20, 60, 65],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Water splash ripples */}
            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={`ripple-${i}`}
                cx="40"
                cy="65"
                r="5"
                fill="none"
                stroke="#4FC3F7"
                strokeWidth="2"
                opacity="0.7"
                initial={{ 
                  r: 5,
                  opacity: 0.7,
                  strokeWidth: 2
                }}
                animate={{ 
                  r: 25,
                  opacity: 0,
                  strokeWidth: 0.5
                }}
                transition={{ 
                  duration: 1,
                  delay: 0.8 + i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Sparkles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const radius = 25;
              const x = 40 + Math.cos(angle) * radius;
              const y = 40 + Math.sin(angle) * radius;
              
              return (
                <motion.g key={`sparkle-${i}`}>
                  <motion.path
                    d={`M ${x} ${y-2} L ${x+1.5} ${y} L ${x} ${y+2} L ${x-1.5} ${y} Z`}
                    fill="#FFD700"
                    initial={{ 
                      scale: 0,
                      opacity: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: 180
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: 0.5 + i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                </motion.g>
              );
            })}

            {/* Central water splash */}
            <motion.ellipse
              cx="40"
              cy="65"
              rx="8"
              ry="3"
              fill="#81D4FA"
              opacity="0.8"
              initial={{ 
                rx: 0,
                ry: 0,
                opacity: 0
              }}
              animate={{ 
                rx: [0, 12, 8],
                ry: [0, 4, 3],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 1,
                delay: 0.8,
                ease: "easeOut"
              }}
            />

            {/* Water bottle/watering can icon */}
            <motion.g
              initial={{ 
                y: -10,
                opacity: 0,
                rotate: -30
              }}
              animate={{ 
                y: 0,
                opacity: 1,
                rotate: 0
              }}
              exit={{
                y: -10,
                opacity: 0
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <motion.path
                d="M 35 10 L 45 10 L 45 15 L 50 15 L 52 13 L 52 17 L 45 17 L 45 20 L 35 20 Z"
                fill="#4CAF50"
                stroke="#2E7D32"
                strokeWidth="1"
                animate={{
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: "easeInOut"
                }}
              />
            </motion.g>

            {/* Success checkmark */}
            <motion.path
              d="M 32 45 L 37 50 L 48 39"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{
                pathLength: 0,
                opacity: 0
              }}
              animate={{
                pathLength: 1,
                opacity: 1
              }}
              transition={{
                duration: 0.5,
                delay: 1.5,
                ease: "easeOut"
              }}
            />
          </svg>

          {/* Floating water bubbles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-70"
              style={{
                left: `${30 + i * 15}%`,
                top: '60%'
              }}
              initial={{ 
                y: 0,
                opacity: 0.7,
                scale: 1
              }}
              animate={{ 
                y: -40,
                opacity: 0,
                scale: 0.5
              }}
              transition={{ 
                duration: 2,
                delay: 1 + i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 