'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ImageDisplay } from '@/components/ImageDisplay';
import { usePlants } from '@/lib/plant-store';
import { WaterAnimation } from '@/components/WaterAnimation';
// SwipeableCard removed - users must use buttons instead
// PullToRefreshIndicator removed - no more gesture-based refresh
import { NightModeToggle } from '@/components/NightModeToggle';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { useListScrollOptimization, useHorizontalScrollOptimization } from '@/hooks/useScrollOptimization';
import { format } from 'date-fns';
import { PageLoader, PageHeader, PageContent } from '@/components/PageLoader';
import { usePageWithPlants } from '@/hooks/usePageReady';

export default function ListPage() {
  const { plants, waterPlant, removePlant, recentlyWateredPlant, clearRecentlyWatered } = usePlants();
  const [filter, setFilter] = useState<'all' | 'healthy' | 'needs_water' | 'overdue'>('all');
  const haptic = useHapticFeedback();
  
  // Use professional page loading pattern
  const { isReady } = usePageWithPlants(500);

  // Scroll optimizations
  const { scrollRef: mainScrollRef, scrollToTop } = useListScrollOptimization();
  const { scrollRef: filterScrollRef } = useHorizontalScrollOptimization();

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

  // Pull to refresh functionality removed - users must use buttons instead

  // Mobile gestures removed - users must use buttons for filter navigation

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'needs_water': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground border-border';
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

  // Show professional loader while page is preparing
  if (!isReady) {
    return <PageLoader message="Loading your plants..." showProgress={true} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-16">
      {/* Header */}
      <PageHeader title="My Plants">
        <Link href="/" className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-foreground">My Plants</h1>
        <div className="flex items-center gap-2">
          <NightModeToggle />
          <Link href="/add-plant" className="text-primary p-2 -m-2 rounded-lg active:bg-primary/20 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </Link>
        </div>
      </PageHeader>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card/60 backdrop-blur-md px-6 py-4 border-b border-border relative z-20"
      >
        <div 
          ref={filterScrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{
            touchAction: 'pan-x',
          }}
        >
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
                // Smooth scroll to top when changing filters
                setTimeout(() => scrollToTop(), 100);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all min-w-fit ${
                filter === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground active:bg-secondary/80'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {label} ({count})
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">

        <div 
          ref={mainScrollRef}
          className="h-full overflow-y-auto px-6 py-4 mobile-scroll-container"
          style={{
            touchAction: 'pan-y',
          }}
        >
          {filteredPlants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {plants.length === 0 ? 'No plants yet' : 'No plants match this filter'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {plants.length === 0 
                  ? 'Add your first plant to get started!' 
                  : 'Try a different filter or add more plants.'}
              </p>
              <Link
                href="/add-plant"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium active:bg-primary/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Plant
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4 pb-nav-safe">
              {filteredPlants.map((plant, index) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="scroll-card"
                >
                  <div className="bg-card dark:bg-gray-800 rounded-xl">
                    <Link href={`/plant/${plant.id}`}>
                      <div className="p-4 bg-card/80 backdrop-blur-md shadow-sm border border-border cursor-pointer active:bg-accent transition-colors relative rounded-xl mobile-list-item mobile-touch-optimized">
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
                                <ImageDisplay
                                  imageId={plant.imageUrl}
                                  alt={plant.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  fallback={
                                    <div 
                                      className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                                      style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                                    >
                                      {plant.icon}
                                    </div>
                                  }
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
                              <h3 className="font-semibold text-foreground truncate">{plant.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{plant.species}</p>
                              
                              {/* Status Badge */}
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(plant.status)}`}>
                                {getStatusText(plant.status)}
                              </div>

                              {/* Watering Info */}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Last watered: {plant.lastWatered === 'Just planted' ? 'Just planted' : format(new Date(plant.lastWatered!), 'MMM dd')}</span>
                                <span>Next: {plant.nextWatering}</span>
                              </div>

                              {/* Notes */}
                              {plant.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{plant.notes}</p>
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
                              className="p-3 text-primary active:bg-primary/20 rounded-lg transition-colors"
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
                              className="p-3 text-destructive active:bg-destructive/20 rounded-lg transition-colors"
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

                    {/* Action Buttons - Now Visible */}
                    <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
                      <motion.button
                        onClick={() => handleWaterPlant(plant.id)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium active:bg-primary/90 transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                        Water
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleRemovePlant(plant.id)}
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium active:bg-destructive/90 transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 