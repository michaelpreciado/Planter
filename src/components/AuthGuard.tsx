'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { NightModeToggle } from '@/components/NightModeToggle';
import { PageLoader } from '@/components/PageLoader';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  message?: string;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  message = "Please sign in to access this feature",
  requireAuth = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If auth is not required, just render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (loading) {
    return <PageLoader message="Checking authentication..." showProgress={true} />;
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show login prompt
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="top-header-fixed bg-card/30 backdrop-blur-md border-b border-border shadow-sm flex items-center justify-between px-6 py-4 pt-safe"
        style={{ 
          // Additional inline styles to ensure it stays fixed
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: '9998',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <Link href="/" className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Plant Tracker</h1>
        <NightModeToggle />
      </motion.header>

      {/* Authentication Required Message */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 content-with-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌱</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border-0"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileTap={{ scale: 0.95 }}
              >
                🌱 Sign In
              </motion.button>
              <Link
                href="/"
                className="block w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-300 text-center"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
} 