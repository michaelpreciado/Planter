'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImageDisplay } from '@/components/ImageDisplay';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { usePlants } from '@/lib/plant-store';
import { NightModeToggle } from '@/components/NightModeToggle';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { format } from 'date-fns';
import { AuthGuard } from '@/components/AuthGuard';
import { FadeIn, SlideUp, ScaleIn, AnimatedButton, Spinner } from '@/components/AnimationReplacements';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'healthy' | 'needs_water' | 'overdue';

export function ListPageClient() {
  const { plants, waterPlant, removePlant, triggerManualSync } = usePlants();
  const searchParams = useSearchParams();
  const router = useRouter();
  const haptic = useHapticFeedback();
  
  // Use URL state for filter - better UX and SSR
  const filter = (searchParams.get('filter') as FilterType) || 'all';
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [waterAnimationId, setWaterAnimationId] = useState<string | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    plantId: string | null;
    plantName: string | null;
  }>({
    isOpen: false,
    plantId: null,
    plantName: null,
  });

  const filteredPlants = plants.filter(plant => {
    if (filter === 'all') return true;
    return plant.status === filter;
  });

  const filters = [
    { key: 'all', label: 'All', count: plants.length },
    { key: 'healthy', label: 'Healthy', count: plants.filter(p => p.status === 'healthy').length },
    { key: 'needs_water', label: 'Needs Water', count: plants.filter(p => p.status === 'needs_water').length },
    { key: 'overdue', label: 'Overdue', count: plants.filter(p => p.status === 'overdue').length },
  ];

  const handleFilterChange = (newFilter: FilterType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newFilter === 'all') {
        params.delete('filter');
      } else {
        params.set('filter', newFilter);
      }
      router.push(`/list?${params.toString()}`);
    });
    haptic.lightImpact();
  };

  const handleWaterPlant = (plantId: string) => {
    setWaterAnimationId(plantId);
    waterPlant(plantId);
    haptic.success();
  };

  const handleRemovePlant = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    setConfirmDialog({
      isOpen: true,
      plantId: plantId,
      plantName: plant?.name || null,
    });
    haptic.lightImpact();
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.plantId) {
      removePlant(confirmDialog.plantId);
      haptic.mediumImpact();
    }
    setConfirmDialog({
      isOpen: false,
      plantId: null,
      plantName: null,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    haptic.lightImpact();
    try {
      await triggerManualSync();
      haptic.success();
    } catch (error) {
      console.error('Refresh failed:', error);
      haptic.error();
    } finally {
      setIsRefreshing(false);
    }
  };

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

  return (
    <AuthGuard message="Please sign in to view and manage your plants">
      <div className="flex flex-col h-full">
        {/* Filter Tabs with refresh button */}
        <FadeIn className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl padding-responsive border-b border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between gap-responsive mb-4">
            <AnimatedButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="ghost"
              className="btn-responsive"
            >
              {isRefreshing ? (
                <Spinner size="sm" />
              ) : (
                <svg className="icon-responsive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              )}
            </AnimatedButton>
            <NightModeToggle />
          </div>
          
          <div className="container-responsive">
            <div className="flex gap-responsive overflow-x-auto scrollbar-hide">
              {filters.map(({ key, label, count }) => (
                <AnimatedButton
                  key={key}
                  onClick={() => handleFilterChange(key as FilterType)}
                  variant={filter === key ? 'primary' : 'secondary'}
                  className="btn-responsive font-medium whitespace-nowrap min-w-fit !px-3 !py-1.5 !text-sm"
                  disabled={isPending}
                >
                  {label} ({count})
                </AnimatedButton>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Plant List */}
        <div className="flex-1 overflow-y-auto pb-nav-safe space-responsive pt-6 pb-8">
          {filteredPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="avatar-responsive bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-responsive-lg">🌱</span>
                </div>
                <h3 className="text-responsive-base font-semibold text-foreground mb-2">
                  No plants found
                </h3>
                <p className="text-muted-foreground mb-6 text-responsive-sm">
                  {plants.length === 0 
                    ? "Start your plant journey by adding your first plant!" 
                    : `No plants match the "${filter}" filter.`}
                </p>
                {plants.length === 0 && (
                  <Link
                    href="/add-plant"
                    className="inline-flex items-center gap-responsive bg-primary text-primary-foreground btn-responsive font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <svg className="icon-responsive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add Your First Plant
                  </Link>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6 px-0">
              {filteredPlants.map((plant, index) => (
                <SlideUp key={plant.id} delay={index * 0.05}>
                  <Link href={`/plant/${plant.id}`}>
                    <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg card-responsive border border-white/20 dark:border-white/10 mx-6 cursor-pointer hover:bg-white/15 dark:hover:bg-gray-900/25 transition-colors">
                      <div className="flex items-start gap-responsive">
                        {/* Plant Image/Icon */}
                        <div className="avatar-responsive overflow-hidden flex-shrink-0">
                          {plant.imageUrl ? (
                            <ImageDisplay
                              imageId={plant.imageUrl}
                              alt={plant.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-full"
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
                          <h3 className="font-semibold text-foreground truncate text-responsive-base">{plant.name}</h3>
                          <p className="text-responsive-sm text-muted-foreground capitalize mb-2">{plant.species}</p>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center btn-responsive rounded-full text-responsive-sm font-medium border ${getStatusColor(plant.status)}`}>
                            {getStatusText(plant.status)}
                          </div>

                          {/* Watering Info */}
                          <div className="flex items-center gap-responsive mt-3 text-responsive-sm text-muted-foreground">
                            <span>Last: {plant.lastWatered === 'Just planted' ? 'Just planted' : format(new Date(plant.lastWatered!), 'MMM dd')}</span>
                            <span>Next: {plant.nextWatering}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-responsive mt-4 pt-4 border-t border-white/20 dark:border-white/10">
                        <AnimatedButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWaterPlant(plant.id);
                          }}
                          variant="primary"
                          className="flex items-center gap-responsive btn-responsive font-medium"
                        >
                          <svg className="icon-responsive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                          </svg>
                          Water
                        </AnimatedButton>
                        
                        <AnimatedButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemovePlant(plant.id);
                          }}
                          variant="ghost"
                          className="flex items-center gap-responsive btn-responsive font-medium text-destructive"
                        >
                          <svg className="icon-responsive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </AnimatedButton>
                      </div>
                    </div>
                  </Link>
                </SlideUp>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, plantId: null, plantName: null })}
          onConfirm={handleConfirmDelete}
          title="Delete Plant?"
          message="This action cannot be undone. All data associated with this plant will be permanently removed."
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          plantName={confirmDialog.plantName || undefined}
        />
      </div>
    </AuthGuard>
  );
}