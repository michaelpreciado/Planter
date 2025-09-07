'use client';

import React, { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';
import { calculateHydrationPercentage, getStatusFromHydration, getSpriteForStatus, type Status } from '@/utils/hydration';

// Memoized particle component for better performance
const Particle = memo(({ type, delay }: { type: string; delay: number }) => {
  const particleVariants = useMemo(() => ({
    initial: { opacity: 0, scale: 0, y: 0 },
    animate: { 
      opacity: [0, 1, 1, 0], 
      scale: [0, 1, 1.2, 0],
      y: [-20, -40, -60, -80]
    },
    exit: { opacity: 0, scale: 0 }
  }), []);

  return (
    <motion.div
      className="absolute text-2xl pointer-events-none"
      variants={particleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 2,
        delay,
        ease: "easeOut"
      }}
      style={{
        left: `${20 + Math.random() * 60}%`,
        top: `${20 + Math.random() * 40}%`
      }}
    >
      {type}
    </motion.div>
  );
});

Particle.displayName = 'Particle';

interface TamagotchiBlobProps {
  size?: number;
  showAnimation?: boolean;
  mood?: Status | 'neutral';
}

export const TamagotchiBlob = memo(({ 
  size = 150, 
  showAnimation = false, 
  mood = 'neutral' 
}: TamagotchiBlobProps) => {
  const { plants } = usePlants();
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<{ id: number; type: string; delay: number }[]>([]);
  const [hasEntryPlayed, setHasEntryPlayed] = useState(false);

  // Optimized mood calculation with proper memoization
  const plantsHash = useMemo(() => 
    plants.map(p => `${p.id}-${p.lastWatered}-${p.nextWatering}-${p.wateringFrequency}`).join('|'), 
    [plants]
  );
  
  const calculatedMood = useMemo(() => {
    if (plants.length === 0) return 'neutral';
    
    // Calculate average hydration across all plants
    const plantsWithHydration = plants.map(plant => {
      if (!plant.lastWatered || !plant.nextWatering) return 50;
      
      const lastWatered = plant.lastWatered === 'Just planted' ? new Date() : new Date(plant.lastWatered);
      const nextWaterDue = new Date(lastWatered.getTime() + (plant.wateringFrequency * 24 * 60 * 60 * 1000));
      
      return calculateHydrationPercentage(lastWatered, nextWaterDue);
    });
    
    const avgHydration = plantsWithHydration.reduce((sum, h) => sum + h, 0) / plantsWithHydration.length;
    return getStatusFromHydration(avgHydration);
  }, [plants, plantsHash]);

  const currentMood = mood !== 'neutral' ? mood : calculatedMood;

  // Get sprite URL based on mood - optimized without console logs
  const spriteUrl = useMemo(() => {
    // Convert 'neutral' to a valid Status
    const validStatus: Status = currentMood === 'neutral' ? 'happy' : currentMood;
    return getSpriteForStatus(validStatus);
  }, [currentMood]);

  // Memoized glow color
  const glowColor = useMemo(() => {
    switch (currentMood) {
      case 'happy': return '#10B981';
      case 'thirsty': return '#F59E0B';
      case 'mad': return '#EF4444';
      default: return '#6B7280';
    }
  }, [currentMood]);

  // Optimized animation using RAF instead of setInterval
  const animationRequestRef = useRef<number | null>(null);
  const lastAnimationTime = useRef<number>(0);
  
  useEffect(() => {
    if (!showAnimation) {
      if (animationRequestRef.current) {
        cancelAnimationFrame(animationRequestRef.current);
        animationRequestRef.current = null;
      }
      return;
    }
    
    const animate = (timestamp: number) => {
      if (timestamp - lastAnimationTime.current >= 8000) {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 3000);
        lastAnimationTime.current = timestamp;
      }
      animationRequestRef.current = requestAnimationFrame(animate);
    };
    
    animationRequestRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRequestRef.current) {
        cancelAnimationFrame(animationRequestRef.current);
      }
    };
  }, [showAnimation]);

  // Optimized particle generation with static function
  const generateParticles = useCallback((type: string, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      type,
      delay: i * 0.2
    }));
  }, []);

  // Effect particles based on mood - debounced for performance
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!isActive) return;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Batch particle updates to reduce state changes
    const particleConfig = {
      'happy': { type: '✨', count: 5 },
      'thirsty': { type: '💧', count: 3 },
      'mad': { type: '💢', count: 3 },
      'default': { type: '🌿', count: 2 }
    };
    
    const config = particleConfig[currentMood as keyof typeof particleConfig] || particleConfig.default;
    const newParticles = generateParticles(config.type, config.count);

    setParticles(newParticles);
    
    timeoutRef.current = setTimeout(() => {
      setParticles([]);
    }, 2500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, currentMood, generateParticles]);

  return (
    <div 
      className="relative inline-block cursor-pointer select-none"
      style={{ width: size, height: size }}
      onClick={() => setIsActive(!isActive)}
      onTouchStart={() => setIsActive(!isActive)}
    >
      {/* Breathing glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30 blur-xl"
        style={{ backgroundColor: glowColor }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Tamagotchi container */}
      <motion.div
        className="relative w-full h-full"
        initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
        animate={{ 
          scale: hasEntryPlayed ? 1 : 1,
          rotate: hasEntryPlayed ? 0 : 0,
          opacity: 1
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8,
          onComplete: () => setHasEntryPlayed(true)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Idle breathing animation */}
        <motion.div
          className="w-full h-full"
          animate={!isActive ? {
            scale: [1, 1.02, 1],
            rotate: [0, 1, -1, 0]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Active state complex animation */}
          <motion.div
            className="w-full h-full relative"
            animate={isActive ? {
              scale: [1, 1.1, 0.95, 1.05, 1],
              rotate: [0, -5, 5, -2, 0],
              y: [0, -10, 5, -5, 0]
            } : {}}
            transition={{
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <Image
              src={spriteUrl}
              alt={`Plant companion - ${currentMood}`}
              width={size}
              height={size}
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'crisp-edges'
              }}
              onError={(e) => {
                console.error('Image failed to load:', spriteUrl, e);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', spriteUrl);
              }}
              priority
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            type={particle.type}
            delay={particle.delay}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

TamagotchiBlob.displayName = 'TamagotchiBlob'; 