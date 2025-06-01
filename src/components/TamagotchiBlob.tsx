'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlants } from '@/lib/plant-store';

interface TamagotchiBlobProps {
  size?: number;
  showAnimation?: boolean;
}

type MoodType = 'happy' | 'sad' | 'mad' | 'neutral';

export function TamagotchiBlob({ 
  size = 128, 
  showAnimation = true 
}: TamagotchiBlobProps) {
  const { plants } = usePlants();
  const [mood, setMood] = useState<MoodType>('neutral');
  const [isIdle, setIsIdle] = useState(true);
  
  // Calculate mood based on plant statistics
  useEffect(() => {
    if (plants.length === 0) {
      setMood('neutral');
      return;
    }

    const healthyPlants = plants.filter(p => p.status === 'healthy').length;
    const needsWaterPlants = plants.filter(p => p.status === 'needs_water').length;
    const overduePlants = plants.filter(p => p.status === 'overdue').length;
    
    const totalPlants = plants.length;
    const healthyRatio = healthyPlants / totalPlants;
    
    if (overduePlants > 0) {
      setMood('mad');
    } else if (needsWaterPlants > healthyPlants) {
      setMood('sad');
    } else if (healthyRatio >= 0.8) {
      setMood('happy');
    } else {
      setMood('neutral');
    }
  }, [plants]);

  // Idle animation cycling
  useEffect(() => {
    if (!showAnimation) return;
    
    const idleInterval = setInterval(() => {
      setIsIdle(false);
      setTimeout(() => setIsIdle(true), 2000); // Special animation for 2 seconds, then back to idle
    }, 8000); // Every 8 seconds

    return () => clearInterval(idleInterval);
  }, [showAnimation]);

  const getMoodAnimations = (currentMood: MoodType) => {
    const baseBreathing = {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    };

    switch (currentMood) {
      case 'happy':
        return isIdle ? {
          y: [0, -12, 0],
          rotate: [0, 8, -8, 0],
          scale: [1, 1.08, 1],
          transition: {
            y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        } : {
          y: [0, -20, 10, -5, 0],
          rotate: [0, 15, -10, 5, 0],
          scale: [1, 1.15, 0.95, 1.05, 1],
          transition: { duration: 2, ease: "easeInOut" }
        };
      case 'sad':
        return isIdle ? {
          y: [0, 8, 0],
          rotate: [0, -3, 3, 0],
          scale: [1, 0.92, 1],
          transition: {
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }
        } : {
          y: [0, 15, 0],
          rotate: [0, -8, 8, -3, 0],
          scale: [1, 0.85, 1.02, 0.98, 1],
          transition: { duration: 3, ease: "easeInOut" }
        };
      case 'mad':
        return isIdle ? {
          x: [0, -4, 4, -4, 4, 0],
          rotate: [0, -12, 12, 0],
          scale: [1, 1.15, 1],
          transition: {
            x: { duration: 0.4, repeat: Infinity, repeatDelay: 1.5 },
            rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
          }
        } : {
          x: [0, -8, 8, -6, 6, -4, 4, 0],
          rotate: [0, -20, 20, -15, 15, 0],
          scale: [1, 1.25, 0.9, 1.1, 1],
          transition: { duration: 1.5, ease: "easeInOut" }
        };
      default:
        return isIdle ? {
          y: [0, -4, 0],
          rotate: [0, 2, -2, 0],
          scale: [1, 1.03, 1],
          transition: { 
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        } : {
          y: [0, -8, 2, 0],
          rotate: [0, 5, -3, 0],
          scale: [1, 1.08, 0.98, 1],
          transition: { duration: 2.5, ease: "easeInOut" }
        };
    }
  };

  const getMoodFilter = (currentMood: MoodType) => {
    switch (currentMood) {
      case 'happy':
        return 'brightness(1.15) saturate(1.3) hue-rotate(15deg) drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))';
      case 'sad':
        return 'brightness(0.75) saturate(0.6) hue-rotate(-15deg) blur(0.5px)';
      case 'mad':
        return 'brightness(1.3) saturate(1.4) hue-rotate(20deg) contrast(1.2) drop-shadow(0 0 8px rgba(255, 0, 0, 0.2))';
      default:
        return 'brightness(1.05) saturate(1.1)';
    }
  };

  const getContainerAnimations = () => {
    if (!showAnimation) return {};
    
    return mood === 'happy' ? {
      y: [0, -2, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    } : {};
  };

  const animations = getMoodAnimations(mood);
  
  return (
    <motion.div
      className="relative flex items-center justify-center w-full h-full"
      initial={showAnimation ? { scale: 0.5, opacity: 0, rotate: -180 } : {}}
      animate={{ scale: 1, opacity: 1, rotate: 0, ...getContainerAnimations() }}
      transition={{ 
        type: 'spring', 
        stiffness: 120,
        damping: 20,
        delay: 0.2,
        duration: 1.2
      }}
    >
      {/* Main Tamagotchi Image */}
      <motion.div
        className="relative drop-shadow-xl"
        animate={showAnimation ? animations : {}}
        style={{
          width: size,
          height: size,
          filter: getMoodFilter(mood),
        }}
        whileHover={showAnimation ? {
          scale: 1.1,
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.3 }
        } : {}}
        whileTap={showAnimation ? {
          scale: 0.95,
          rotate: 10,
          transition: { duration: 0.1 }
        } : {}}
      >
        <img
          src="/assets/tamagatchi.png"
          alt="Tamagotchi plant companion"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error('TamagotchiBlob image failed to load:', e);
          }}
          onLoad={() => {
            console.log('TamagotchiBlob image loaded successfully');
          }}
        />
        
        {/* Breathing glow effect */}
        {showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: mood === 'happy' ? 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)' :
                         mood === 'sad' ? 'radial-gradient(circle, rgba(100,149,237,0.1) 0%, transparent 70%)' :
                         mood === 'mad' ? 'radial-gradient(circle, rgba(255,69,0,0.2) 0%, transparent 70%)' :
                         'radial-gradient(circle, rgba(144,238,144,0.1) 0%, transparent 70%)'
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Enhanced mood-based special effects overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {mood === 'mad' && (
          <>
            {/* Anger marks with enhanced animation */}
            <motion.div
              className="absolute"
              style={{ 
                left: '10%', 
                top: '25%',
                fontSize: size * 0.18
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
                rotate: [0, 15, 0]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              💢
            </motion.div>
            <motion.div
              className="absolute"
              style={{ 
                right: '10%', 
                top: '20%',
                fontSize: size * 0.15
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.3, 0.5],
                rotate: [0, -15, 0]
              }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            >
              💢
            </motion.div>
            {/* Steam effect */}
            <motion.div
              className="absolute"
              style={{ 
                left: '40%', 
                top: '10%',
                fontSize: size * 0.12
              }}
              animate={{ 
                y: [0, -size * 0.2],
                opacity: [0.8, 0],
                scale: [0.8, 1.2]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              💨
            </motion.div>
          </>
        )}

        {mood === 'sad' && (
          <>
            {/* Enhanced tear drops */}
            <motion.div
              className="absolute"
              style={{ 
                left: '20%', 
                top: '40%',
                fontSize: size * 0.12
              }}
              animate={{ 
                y: [0, size * 0.4],
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              💧
            </motion.div>
            <motion.div
              className="absolute"
              style={{ 
                right: '25%', 
                top: '42%',
                fontSize: size * 0.1
              }}
              animate={{ 
                y: [0, size * 0.3],
                opacity: [1, 0],
                scale: [1, 0.3]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 4,
                delay: 1
              }}
            >
              💧
            </motion.div>
          </>
        )}

        {mood === 'happy' && (
          <>
            {/* Enhanced happy sparkles with trails */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ 
                  left: `${15 + i * 15}%`, 
                  top: `${20 + (i % 2) * 30}%`,
                  fontSize: size * (0.06 + i * 0.01)
                }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360, 720],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              >
                ✨
              </motion.div>
            ))}
            {/* Hearts */}
            <motion.div
              className="absolute"
              style={{ 
                left: '50%', 
                top: '15%',
                fontSize: size * 0.1
              }}
              animate={{ 
                y: [0, -size * 0.15],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                delay: 1
              }}
            >
              💖
            </motion.div>
          </>
        )}

        {/* Neutral mood gets subtle sparkles */}
        {mood === 'neutral' && (
          <motion.div
            className="absolute"
            style={{ 
              right: '20%', 
              top: '25%',
              fontSize: size * 0.05
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              delay: 2
            }}
          >
            ⭐
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 