'use client';

import Link from 'next/link';
import { TamagotchiBlob } from '@/components/TamagotchiBlob';
import { NightModeToggle } from '@/components/NightModeToggle';
import { AuthModal } from '@/components/AuthModal';
import { usePlants } from '@/lib/plant-store';
import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '@/utils/supabase';
// Replace framer-motion with lightweight CSS animations
import { FadeIn, SlideUp, StaggeredChildren, ScaleIn } from '@/components/OptimizedAnimations';

export default function HomePage() {
  const { plants, triggerManualSync, loading, error, hasHydrated } = usePlants();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const haptic = useHapticFeedback();
  // Debug tools removed
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const healthyPlants = plants.filter(p => p.status === 'healthy').length;
  const plantsNeedingWater = plants.filter(p => p.status === 'needs_water' || p.status === 'overdue').length;
  const isDbConfigured = isSupabaseConfigured();

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading Plant Tracker...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    haptic.mediumImpact();
    await signOut();
  };

  const handleSync = async () => {
    if (!isDbConfigured || !user) return;
    
    haptic.mediumImpact();
    try {
      await triggerManualSync();
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
      <FadeIn delay={0.1} className="flex justify-end items-center pt-safe px-4 sm:px-6 py-4 sm:py-6">
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
            <ScaleIn>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-card/60 backdrop-blur-md hover:bg-card/80 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl border-0 hover:scale-105"
                disabled={authLoading}
              >
                {authLoading ? '...' : '🌱 Sign In'}
              </button>
            </ScaleIn>
          )}
          
          <NightModeToggle />
        </div>
      </FadeIn>

      {/* Header Title */}
      <SlideUp delay={0.2} className="text-center px-4 sm:px-6 pb-6 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Plant Tracker</h1>
        <p className="text-sm sm:text-base text-muted-foreground/80">Keep your plants happy and healthy</p>
      </SlideUp>

      {/* Tamagotchi Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-nav-safe overflow-visible">
        <div className="max-w-sm w-full space-y-8">
          {/* Plant Character - Remove container boundaries to allow glow effect */}
          <FadeIn 
            delay={0.4}
            className="flex justify-center py-8 overflow-visible"
          >
            <TamagotchiBlob size={240} showAnimation={true} />
          </FadeIn>

          {/* User Welcome / Login Prompt */}
          {!user && (
            <SlideUp
              delay={0.6}
              className="bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center shadow-lg border-0"
            >
              <div className="text-foreground text-sm font-medium mb-2">
                🌱 Welcome to Plant Tracker
              </div>
              <p className="text-muted-foreground/80 text-sm mb-4">
                Sign in to save your plants and sync across devices
              </p>
              <ScaleIn>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-card/60 backdrop-blur-md hover:bg-card/80 text-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0 hover:scale-105"
                >
                  Get Started
                </button>
              </ScaleIn>
            </SlideUp>
          )}

          {/* Stats */}
          {user && plants.length > 0 && (
            <SlideUp
              delay={0.8}
              className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-white/10"
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">{healthyPlants}</div>
                  <div className="text-xs text-muted-foreground">Healthy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{plantsNeedingWater}</div>
                  <div className="text-xs text-muted-foreground">Need Water</div>
                </div>
              </div>
            </SlideUp>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
} 