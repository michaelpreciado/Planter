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
        <FadeIn className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl px-6 py-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <AnimatedButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="ghost"
              className="p-2"
            >
              {isRefreshing ? (
                <Spinner size="sm" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              )}
            </AnimatedButton>
            <NightModeToggle />
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: 'All', count: plants.length },
              { key: 'healthy', label: 'Healthy', count: plants.filter(p => p.status === 'healthy').length },
              { key: 'needs_water', label: 'Needs Water', count: plants.filter(p => p.status === 'needs_water').length },
              { key: 'overdue', label: 'Overdue', count: plants.filter(p => p.status === 'overdue').length },
            ].map(({ key, label, count }) => (
              <AnimatedButton
                key={key}
                onClick={() => handleFilterChange(key as FilterType)}
                variant={filter === key ? 'primary' : 'secondary'}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-w-fit"
                disabled={isPending}
              >
                {label} ({count})
              </AnimatedButton>
            ))}
          </div>
        </FadeIn>

        {/* Plant List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredPlants.length === 0 ? (
            <FadeIn className="text-center py-12">
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
            </FadeIn>
          ) : (
            <div className="space-y-4 pb-20">
              {filteredPlants.map((plant, index) => (
                <SlideUp key={plant.id} delay={index * 0.05}>
                  <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-xl border border-white/20 dark:border-white/10 p-4">
                    <Link href={`/plant/${plant.id}`}>
                      <div className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
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
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/50">
                          <AnimatedButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWaterPlant(plant.id);
                            }}
                            variant="primary"
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="flex items-center justify-center gap-2 text-destructive border-destructive/20"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </AnimatedButton>
                        </div>
                      </div>
                    </Link>
                  </div>
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