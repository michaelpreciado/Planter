'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';

export default function SettingsPage() {
  const [isClientReady, setIsClientReady] = useState(false);
  const { hasHydrated, loading, plants } = usePlants();

  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const stats = {
    totalPlants: plants.length,
    healthyPlants: plants.filter(p => p.status === 'healthy').length,
    plantsNeedingWater: plants.filter(p => p.status === 'needs_water' || p.status === 'overdue').length,
  };

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm flex items-center justify-between px-6 py-4 pt-safe"
      >
        <Link href="/" className="text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <div className="w-6"></div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 px-6 py-6 pb-nav-safe">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Garden Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalPlants}</div>
              <div className="text-sm text-gray-600">Total Plants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.healthyPlants}</div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.plantsNeedingWater}</div>
              <div className="text-sm text-gray-600">Need Water</div>
            </div>
          </div>
        </motion.div>

        {/* Settings Options */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Plant Care</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Watering Reminders</div>
                    <div className="text-sm text-gray-600">Get notified when plants need water</div>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Daily Check-ins</div>
                    <div className="text-sm text-gray-600">Reminder to check your plants</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">App Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Dark Mode</div>
                    <div className="text-sm text-gray-600">Switch to dark theme</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Animations</div>
                    <div className="text-sm text-gray-600">Enable app animations</div>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Version</span>
                  <span className="text-gray-500">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Made with</span>
                  <span className="text-gray-500">💚 Next.js & Tailwind</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mt-6"
          >
            <Link
              href="/add-plant"
              className="bg-green-500 text-white p-4 rounded-xl text-center font-medium hover:bg-green-600 transition-colors"
            >
              <div className="text-2xl mb-2">🌱</div>
              Add Plant
            </Link>
            <Link
              href="/list"
              className="bg-blue-500 text-white p-4 rounded-xl text-center font-medium hover:bg-blue-600 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              View List
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 