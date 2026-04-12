'use client';

import dynamic from 'next/dynamic';
import { TamagotchiBlob } from '@/components/TamagotchiBlob';
import { usePlants } from '@/lib/plant-store';
import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { isSupabaseConfigured } from '@/utils/supabase';
import { FadeIn, SlideUp, ScaleIn } from '@/components/AnimationReplacements';

const AuthModal = dynamic(
  () => import('@/components/AuthModal').then((mod) => mod.AuthModal),
  { ssr: false },
);

export default function HomePage() {
  const { plants, triggerManualSync, loading, hasHydrated, syncQueueCount } = usePlants();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const haptic = useHapticFeedback();
  // Debug tools removed
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const healthyPlants = useMemo(
    () => plants.filter((p) => p.status === 'healthy').length,
    [plants],
  );
  const plantsNeedingWater = useMemo(
    () => plants.filter((p) => p.status === 'needs_water' || p.status === 'overdue').length,
    [plants],
  );
  const isDbConfigured = isSupabaseConfigured();
  const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

  const handleSignOut = useCallback(async () => {
    haptic.mediumImpact();
    await signOut();
  }, [haptic, signOut]);

  const handleSync = useCallback(async () => {
    if (!isDbConfigured || !user) return;
    
    haptic.mediumImpact();
    try {
      await triggerManualSync();
      haptic.success();
    } catch (error) {
      console.error('Sync failed:', error);
      haptic.error();
    }
  }, [haptic, isDbConfigured, triggerManualSync, user]);

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

  return (
    <div className="min-h-screen max-h-screen bg-background flex flex-col ios-safe-layout mobile-content overflow-hidden">
      {/* Header with Title and Auth */}
      <FadeIn delay={0.1} className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-4">
        {/* User Menu for signed in users */}
        {user && (
          <div className="flex justify-end items-center pt-safe-ios pb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-medium text-foreground">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm sm:text-base">🌱</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Sign In Button */}
        {!user && (
          <SlideUp delay={0.2} className="flex justify-end items-center pt-safe-ios">
            <ScaleIn>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-card/30 backdrop-blur-md hover:bg-card/40 text-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl border-0 hover:scale-105"
                disabled={authLoading}
              >
                {authLoading ? '...' : '🌱 Sign In'}
              </button>
            </ScaleIn>
          </SlideUp>
        )}
      </FadeIn>

      {/* Main Content Area - Flexible */}
      <div className="flex-1 flex flex-col justify-between items-center overflow-hidden min-h-0 pb-20 sm:pb-24">
        {/* Tamagotchi Character - Takes available space */}
        <div className="flex-1 flex flex-col justify-center items-center w-full min-h-0 py-2 sm:py-4">
          <FadeIn 
            delay={0.4}
            className="flex justify-center items-center overflow-visible h-full max-h-full"
          >
            <div className="scale-75 xs:scale-90 sm:scale-110 md:scale-125 lg:scale-150 xl:scale-175 transition-transform duration-300 ease-out">
              <TamagotchiBlob 
                size={320} 
                showAnimation={true} 
              />
            </div>
          </FadeIn>
        </div>

        {/* Bottom Content - Welcome Message or Stats */}
        <div className="flex-shrink-0 w-full px-4 sm:px-6 pb-2 sm:pb-4">
          {/* User Welcome / Login Prompt */}
          {!user && (
            <SlideUp
              delay={0.6}
              className="bg-card/15 backdrop-blur-md rounded-xl p-4 sm:p-6 text-center shadow-lg border-0 max-w-xs sm:max-w-sm mx-auto"
            >
              <div className="text-foreground/90 text-sm sm:text-base font-medium mb-3 sm:mb-4">
                🌱 Welcome to Plant Tracker
              </div>
              <div className="h-2 sm:h-3"></div> {/* Transparent spacer */}
              <p className="text-muted-foreground/60 text-xs sm:text-sm mb-4 sm:mb-6">
                Sign in to save your plants and sync across devices
              </p>
              <ScaleIn>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-card/30 backdrop-blur-md hover:bg-card/40 text-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0 hover:scale-105 w-full sm:w-auto"
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
              className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 dark:border-white/10 max-w-md mx-auto"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full font-medium ${isOffline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {isOffline ? 'Offline mode active' : 'Online and ready'}
                </span>
                {syncQueueCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    {syncQueueCount} pending sync {syncQueueCount === 1 ? 'change' : 'changes'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 sm:gap-8 text-center">
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500">{healthyPlants}</div>
                  <div className="h-1 sm:h-2"></div> {/* Transparent spacer */}
                  <div className="text-xs sm:text-sm text-muted-foreground/70">Healthy</div>
                </div>
                <div>
                  {plantsNeedingWater > 0 ? (
                    <button
                      onClick={() => {
                        haptic.lightImpact();
                        router.push('/list?filter=needs_attention');
                      }}
                      className="group w-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-background rounded-lg hover:bg-yellow-500/10 active:bg-yellow-500/20"
                    >
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">
                        {plantsNeedingWater}
                      </div>
                      <div className="h-1 sm:h-2"></div> {/* Transparent spacer */}
                      <div className="text-xs sm:text-sm text-muted-foreground/70 group-hover:text-foreground transition-colors flex items-center justify-center gap-1">
                        Need Water
                        <svg className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </button>
                  ) : (
                    <div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-500">{plantsNeedingWater}</div>
                      <div className="h-1 sm:h-2"></div> {/* Transparent spacer */}
                      <div className="text-xs sm:text-sm text-muted-foreground/70">Need Water</div>
                    </div>
                  )}
                </div>
              </div>
              {syncQueueCount > 0 && (
                <button
                  onClick={handleSync}
                  className="mt-5 w-full bg-primary/20 hover:bg-primary/30 text-primary-foreground rounded-xl py-2.5 text-sm font-medium transition-colors"
                >
                  Sync now
                </button>
              )}
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
