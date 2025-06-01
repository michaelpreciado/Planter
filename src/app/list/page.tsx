'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';
import { WaterAnimation } from '@/components/WaterAnimation';
import { SwipeableCard } from '@/components/SwipeableCard';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { BottomNavigation } from '@/components/BottomNavigation';
import { NightModeToggle } from '@/components/NightModeToggle';
import { usePullToRefresh, useHapticFeedback, useMobileGestures } from '@/hooks/useMobileGestures';
import { format } from 'date-fns';

export default function ListPage() {
  const { plants, waterPlant, removePlant, recentlyWateredPlant, clearRecentlyWatered } = usePlants();
  const [filter, setFilter] = useState<'all' | 'healthy' | 'needs_water' | 'overdue'>('all');
  const haptic = useHapticFeedback();

  const filteredPlants = plants.filter(plant => {
    if (filter === 'all') return true;
    return plant.status === filter;
  });

  const handleWaterPlant = (plantId: string) => {
    waterPlant(plantId);
    haptic.success();
    // Clear the animation after it completes
    setTimeout(() => {
      clearRecentlyWatered();
    }, 3000);
  };

  const handleRemovePlant = (plantId: string) => {
    removePlant(plantId);
    haptic.mediumImpact();
  };

  // Pull to refresh functionality
  const handleRefresh = async () => {
    haptic.lightImpact();
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you might refetch data here
  };

  const { containerRef, isRefreshing, pullDistance, pullProgress } = usePullToRefresh(handleRefresh);

  // Mobile gestures for filter navigation
  useMobileGestures({
    onSwipeLeft: () => {
      const filters = ['all', 'healthy', 'needs_water', 'overdue'] as const;
      const currentIndex = filters.indexOf(filter);
      if (currentIndex < filters.length - 1) {
        setFilter(filters[currentIndex + 1]);
        haptic.lightImpact();
      }
    },
    onSwipeRight: () => {
      const filters = ['all', 'healthy', 'needs_water', 'overdue'] as const;
      const currentIndex = filters.indexOf(filter);
      if (currentIndex > 0) {
        setFilter(filters[currentIndex - 1]);
        haptic.lightImpact();
      }
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_water': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'needs_water': return 'Needs Water';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-20">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm flex items-center justify-between px-6 py-4 pt-safe relative z-20 dark:bg-gray-800"
      >
        <Link href="/" className="text-gray-700 p-2 -m-2 rounded-lg active:bg-gray-100 transition-colors dark:text-gray-300 dark:active:bg-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Plants</h1>
        <div className="flex items-center gap-2">
          <NightModeToggle />
          <Link href="/add-plant" className="text-green-600 p-2 -m-2 rounded-lg active:bg-green-50 transition-colors dark:active:bg-green-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </Link>
        </div>
      </motion.header>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white px-6 py-4 border-b border-gray-200 relative z-20"
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: 'All', count: plants.length },
            { key: 'healthy', label: 'Healthy', count: plants.filter(p => p.status === 'healthy').length },
            { key: 'needs_water', label: 'Needs Water', count: plants.filter(p => p.status === 'needs_water').length },
            { key: 'overdue', label: 'Overdue', count: plants.filter(p => p.status === 'overdue').length },
          ].map(({ key, label, count }) => (
            <motion.button
              key={key}
              onClick={() => {
                setFilter(key as any);
                haptic.lightImpact();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-w-fit ${
                filter === key
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {label} ({count})
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content with Pull to Refresh */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ paddingTop: isRefreshing ? 80 : 0 }}
      >
        <PullToRefreshIndicator 
          progress={pullProgress}
          isRefreshing={isRefreshing}
          pullDistance={pullDistance}
        />

        <div className="h-full overflow-y-auto px-6 py-4">
          {filteredPlants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {plants.length === 0 ? 'No plants yet' : 'No plants match this filter'}
              </h2>
              <p className="text-gray-600 mb-6">
                {plants.length === 0 
                  ? 'Add your first plant to get started!' 
                  : 'Try a different filter or add more plants.'}
              </p>
              <Link
                href="/add-plant"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium active:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Plant
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4 pb-safe">
              {filteredPlants.map((plant, index) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SwipeableCard
                    onSwipeLeft={() => handleRemovePlant(plant.id)}
                    onSwipeRight={() => handleWaterPlant(plant.id)}
                    leftAction={{
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      ),
                      color: '#EF4444',
                      label: 'Delete'
                    }}
                    rightAction={{
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                      ),
                      color: '#3B82F6',
                      label: 'Water'
                    }}
                  >
                    <Link href={`/plant/${plant.id}`}>
                      <div className="p-4 shadow-sm border border-gray-200 cursor-pointer active:bg-gray-50 transition-colors relative">
                        {/* Water Animation */}
                        <WaterAnimation 
                          isVisible={recentlyWateredPlant === plant.id}
                          onComplete={() => clearRecentlyWatered()}
                          size="small"
                        />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Plant Image/Icon */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              {plant.imageUrl ? (
                                <img
                                  src={plant.imageUrl}
                                  alt={plant.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div 
                                  className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                                  style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                                >
                                  {plant.icon}
                                </div>
                              )}
                            </div>

                            {/* Plant Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{plant.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{plant.species}</p>
                              
                              {/* Status Badge */}
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(plant.status)}`}>
                                {getStatusText(plant.status)}
                              </div>

                              {/* Watering Info */}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Last watered: {plant.lastWatered === 'Just planted' ? 'Just planted' : format(new Date(plant.lastWatered!), 'MMM dd')}</span>
                                <span>Next: {plant.nextWatering}</span>
                              </div>

                              {/* Notes */}
                              {plant.notes && (
                                <p className="text-xs text-gray-600 mt-1">{plant.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Actions - smaller for mobile */}
                          <div className="flex items-center gap-1 ml-2">
                            {/* Water Button */}
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleWaterPlant(plant.id);
                              }}
                              className="p-3 text-blue-600 active:bg-blue-50 rounded-lg transition-colors"
                              whileTap={{ scale: 0.9 }}
                              title="Water plant"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                              </svg>
                            </motion.button>

                            {/* Delete Button */}
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemovePlant(plant.id);
                              }}
                              className="p-3 text-red-600 active:bg-red-50 rounded-lg transition-colors"
                              whileTap={{ scale: 0.9 }}
                              title="Remove plant"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwipeableCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
} 