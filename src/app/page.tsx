'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TamagotchiBlob } from '@/components/TamagotchiBlob';
import { NightModeToggle } from '@/components/NightModeToggle';
import { AuthModal } from '@/components/AuthModal';
import { usePlants } from '@/lib/plant-store';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileGestures, useHapticFeedback } from '@/hooks/useMobileGestures';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { plants, initializeSampleData } = usePlants();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const haptic = useHapticFeedback();
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const healthyPlants = plants.filter(p => p.status === 'healthy').length;
  const plantsNeedingWater = plants.filter(p => p.status === 'needs_water' || p.status === 'overdue').length;

  // Mobile gestures for navigation
  useMobileGestures({
    onSwipeLeft: () => {
      router.push('/list');
      haptic.lightImpact();
    },
    onSwipeRight: () => {
      router.push('/add-plant');
      haptic.lightImpact();
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const blobVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const handleInitializeSampleData = () => {
    initializeSampleData();
    haptic.success();
    setTimeout(() => {
      router.push('/list');
    }, 500);
  };

  const handleSignOut = async () => {
    haptic.mediumImpact();
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Controls */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-end items-center pt-safe px-6 py-6"
      >
        {/* Auth and Night Mode Controls */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowAuthModal(true)}
              className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md border border-white/30 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileTap={{ scale: 0.95 }}
              disabled={authLoading}
            >
              {authLoading ? '...' : '🌱 Sign In'}
            </motion.button>
          )}
          
          <NightModeToggle />
        </div>
      </motion.div>

      {/* Header Title */}
      <motion.header
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="text-center px-6 pb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Plant Tracker</h1>
        <p className="text-gray-600 dark:text-gray-300">Keep your plants happy and healthy</p>
      </motion.header>

      {/* Tamagotchi Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center px-6"
      >
        <div className="max-w-sm w-full">
          {/* Plant Character */}
          <motion.div 
            variants={blobVariants}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <TamagotchiBlob size={200} showAnimation={true} />
              
              {/* Mood indicator */}
              <motion.div
                variants={itemVariants}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                {!user ? (
                  <span className="text-blue-500 text-lg">😴</span>
                ) : plantsNeedingWater > 0 ? (
                  <span className="text-red-500 text-lg">😰</span>
                ) : (
                  <span className="text-green-500 text-lg">😊</span>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* User Welcome / Login Prompt */}
          {!user && (
            <motion.div
              variants={itemVariants}
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-700/50 rounded-2xl p-6 mb-8 text-center shadow-lg"
            >
              <div className="text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
                🌱 Welcome to Plant Tracker
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Sign in to save your plants and sync across devices
              </p>
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="bg-white/30 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/50 hover:bg-white/40 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          )}

          {/* Stats */}
          {user && plants.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-8 shadow-lg dark:bg-gray-800/80"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{healthyPlants}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Healthy Plants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{plantsNeedingWater}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Need Water</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
            {/* Debug Tools */}
            {user && plants.length === 0 && (
              <motion.div 
                variants={itemVariants}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4"
              >
                <div className="text-center">
                  <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-2">No plants yet?</div>
                  <button
                    onClick={handleInitializeSampleData}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                  >
                    Add Sample Plants for Testing
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Gesture Hint */}
          {user && (
            <motion.div
              variants={itemVariants}
              className="text-center mt-8 text-xs text-gray-500 dark:text-gray-400"
            >
              👈 Swipe left for plants • Swipe right to add plant 👉
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
} 