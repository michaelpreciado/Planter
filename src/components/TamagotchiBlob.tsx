'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
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

  // Determine mood based on plants using hydration logic
  const calculatedMood = useMemo(() => {
    if (plants.length === 0) return 'neutral';
    
    // Calculate average hydration across all plants
    const plantsWithHydration = plants.map(plant => {
      if (!plant.lastWatered || !plant.nextWatering) return 50; // Default to moderate hydration
      
      const lastWatered = plant.lastWatered === 'Just planted' ? new Date() : new Date(plant.lastWatered);
      const nextWaterDue = new Date(lastWatered.getTime() + (plant.wateringFrequency * 24 * 60 * 60 * 1000));
      
      return calculateHydrationPercentage(lastWatered, nextWaterDue);
    });
    
    const avgHydration = plantsWithHydration.reduce((sum, h) => sum + h, 0) / plantsWithHydration.length;
    return getStatusFromHydration(avgHydration);
  }, [plants]);

  const currentMood = mood !== 'neutral' ? mood : calculatedMood;

  // Get sprite URL based on mood
  const spriteUrl = useMemo(() => {
    if (currentMood === 'neutral') return '/assets/happy.png'; // Default sprite
    if (currentMood === 'thirsty') return '/assets/thirsty.png';
    return getSpriteForStatus(currentMood as Status);
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

  // Auto-cycle animation
  useEffect(() => {
    if (!showAnimation) return;
    
    const interval = setInterval(() => {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 3000);
    }, 8000);

    return () => clearInterval(interval);
  }, [showAnimation]);

  // Particle generation
  const generateParticles = useMemo(() => (type: string, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      type,
      delay: i * 0.2
    }));
  }, []);

  // Effect particles based on mood
  useEffect(() => {
    if (!isActive) return;

    let newParticles: { id: number; type: string; delay: number }[] = [];
    
    switch (currentMood) {
      case 'happy':
        newParticles = generateParticles('✨', 5);
        break;
      case 'thirsty':
        newParticles = generateParticles('💧', 3);
        break;
      case 'mad':
        newParticles = generateParticles('💢', 3);
        break;
      default:
        newParticles = generateParticles('🌿', 2);
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
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
              priority={size > 100}
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