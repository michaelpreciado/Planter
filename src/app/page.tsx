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
import { isSupabaseConfigured } from '@/utils/supabase';

export default function HomePage() {
  const { plants, initializeSampleData, syncWithDatabase, loading, error } = usePlants();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const haptic = useHapticFeedback();
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const healthyPlants = plants.filter(p => p.status === 'healthy').length;
  const plantsNeedingWater = plants.filter(p => p.status === 'needs_water' || p.status === 'overdue').length;
  const isDbConfigured = isSupabaseConfigured();

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

  const handleSync = async () => {
    if (!isDbConfigured || !user) return;
    
    haptic.mediumImpact();
    try {
      await syncWithDatabase();
      setLastSyncTime(new Date().toLocaleTimeString());
      haptic.success();
    } catch (error) {
      console.error('Sync failed:', error);
      haptic.error();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-safe">
      {/* Top Controls */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-end items-center pt-safe px-4 sm:px-6 py-4 sm:py-6"
      >
        {/* Auth and Night Mode Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowAuthModal(true)}
              className="bg-card/80 backdrop-blur-md border border-border hover:bg-card text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
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
        className="text-center px-4 sm:px-6 pb-6 sm:pb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Plant Tracker</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Keep your plants happy and healthy</p>
      </motion.header>

      {/* Tamagotchi Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-start justify-center px-4 sm:px-6 pb-20 sm:pb-16 overflow-y-auto"
      >
        <div className="max-w-sm w-full space-y-6">
          {/* Plant Character */}
          <motion.div 
            variants={blobVariants}
            className="flex justify-center"
          >
            <div className="relative">
              <TamagotchiBlob size={160} showAnimation={true} />
              
              {/* Mood indicator */}
              <motion.div
                variants={itemVariants}
                className="absolute -top-4 -right-4 w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center border-2 border-background"
              >
                {!user ? (
                  <span className="text-blue-500 text-xl">😴</span>
                ) : plantsNeedingWater > 0 ? (
                  <span className="text-red-500 text-xl">😰</span>
                ) : (
                  <span className="text-green-500 text-xl">😊</span>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* User Welcome / Login Prompt */}
          {!user && (
            <motion.div
              variants={itemVariants}
              className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 sm:p-6 text-center shadow-lg"
            >
              <div className="text-foreground text-sm font-medium mb-2">
                🌱 Welcome to Plant Tracker
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Sign in to save your plants and sync across devices
              </p>
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="bg-card/80 backdrop-blur-md border border-border hover:bg-card text-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
              className="bg-card/80 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{healthyPlants}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Healthy Plants</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{plantsNeedingWater}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Need Water</div>
                </div>
              </div>
              
              {/* Sync Status */}
              <div className="border-t border-border pt-4">
                {!isDbConfigured ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-xs text-muted-foreground">Offline Mode</span>
                    </div>
                    <Link 
                      href="/SUPABASE_SETUP.md" 
                      className="text-xs text-blue-500 hover:text-blue-600"
                    >
                      Enable Sync
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                      <span className="text-xs text-muted-foreground">
                        {loading ? 'Syncing...' : lastSyncTime ? `Synced ${lastSyncTime}` : 'Cloud Sync Ready'}
                      </span>
                    </div>
                    <button
                      onClick={handleSync}
                      disabled={loading}
                      className="text-xs text-blue-500 hover:text-blue-600 disabled:text-gray-400"
                    >
                      🔄 Sync
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Database Setup Notice */}
          {user && !isDbConfigured && (
            <motion.div
              variants={itemVariants}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center"
            >
              <div className="text-center">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
                  📱 Enable Cross-Device Sync
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                  Your plants are saved locally. Set up cloud sync to access them from any device!
                </p>
                <Link
                  href="/test"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors inline-block"
                >
                  View Setup Guide
                </Link>
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
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 text-center"
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
              className="text-center text-xs text-muted-foreground"
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