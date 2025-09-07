'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';
import { ImageDisplay } from '@/components/ImageDisplay';
import { useListScrollOptimization } from '@/hooks/useScrollOptimization';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { PageLoader, PageHeader } from '@/components/PageLoader';
import { usePageWithPlants } from '@/hooks/usePageReady';
import { format, formatDistanceToNow } from 'date-fns';

interface NoteEntry {
  id: string;
  plantId: string;
  plantName: string;
  plantIcon: string;
  plantIconColor: string;
  text: string;
  images: string[];
  timestamp: string;
  createdAt: Date;
  displayTime: string;
}

export default function NotesPage() {
  const router = useRouter();
  const { plants, hasHydrated, loading } = usePlants();
  const [isClientReady, setIsClientReady] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'with-photos'>('all');
  const haptic = useHapticFeedback();
  const { scrollRef, scrollToTop } = useListScrollOptimization();

  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Extract and sort all notes from all plants - MUST be before early return
  const allNotes = useMemo(() => {
    const notes: NoteEntry[] = [];
    
    plants.forEach(plant => {
      if (plant.notes) {
        try {
          const plantNotes = JSON.parse(plant.notes);
          if (Array.isArray(plantNotes)) {
            plantNotes.forEach((note: any) => {
              // Use the note's ID (which is Date.now().toString()) to get the actual creation time
              const creationDate = note.id && !note.id.startsWith('legacy-') 
                ? new Date(parseInt(note.id))
                : new Date();
              
              notes.push({
                id: note.id || `${plant.id}-${Date.now()}`,
                plantId: plant.id,
                plantName: plant.name,
                plantIcon: plant.icon,
                plantIconColor: plant.iconColor,
                text: note.text || '',
                images: note.images || [],
                timestamp: note.timestamp || format(creationDate, 'MMM dd, HH:mm'),
                createdAt: creationDate,
                displayTime: formatDistanceToNow(creationDate, { addSuffix: true })
              });
            });
          }
        } catch {
          // Handle legacy format
          const noteLines = plant.notes.split('\n').filter(line => line.trim());
          noteLines.forEach((note, index) => {
            const creationDate = new Date(Date.now() - (noteLines.length - index) * 60000);
            
            if (note.includes(':')) {
              const [datePart, ...textParts] = note.split(':');
              notes.push({
                id: `legacy-${plant.id}-${index}`,
                plantId: plant.id,
                plantName: plant.name,
                plantIcon: plant.icon,
                plantIconColor: plant.iconColor,
                text: textParts.join(':').trim(),
                images: [],
                timestamp: datePart,
                createdAt: creationDate,
                displayTime: formatDistanceToNow(creationDate, { addSuffix: true })
              });
            } else {
              notes.push({
                id: `legacy-${plant.id}-${index}`,
                plantId: plant.id,
                plantName: plant.name,
                plantIcon: plant.icon,
                plantIconColor: plant.iconColor,
                text: note,
                images: [],
                timestamp: format(creationDate, 'MMM dd'),
                createdAt: creationDate,
                displayTime: formatDistanceToNow(creationDate, { addSuffix: true })
              });
            }
          });
        }
      }
    });
    
    // Sort by creation date (latest first)
    return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [plants]);

  // Filter notes based on selected filter - MUST be before early return
  const filteredNotes = useMemo(() => {
    switch (filter) {
      case 'recent':
        // Notes from last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return allNotes.filter(note => note.createdAt > weekAgo);
      case 'with-photos':
        return allNotes.filter(note => note.images.length > 0);
      default:
        return allNotes;
    }
  }, [allNotes, filter]);

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    haptic.lightImpact();
    setTimeout(() => scrollToTop(), 100);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col ios-safe-layout mobile-content">
      {/* Header */}
      <PageHeader title="Plant Notes">
        <button 
          onClick={() => {
            router.back();
            haptic.lightImpact();
          }}
          className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-foreground">Plant Notes</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
      </PageHeader>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-transparent backdrop-blur-md px-6 py-4 relative z-20"
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: 'All Notes', count: allNotes.length },
            { key: 'recent', label: 'Recent', count: allNotes.filter(note => note.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
            { key: 'with-photos', label: 'With Photos', count: allNotes.filter(note => note.images.length > 0).length },
          ].map(({ key, label, count }) => (
            <motion.button
              key={key}
              onClick={() => handleFilterChange(key as typeof filter)}
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

      {/* Notes List */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto px-6 py-4 mobile-scroll-container"
          style={{ touchAction: 'pan-y' }}
        >
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {allNotes.length === 0 ? 'No notes yet' : 'No notes match this filter'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {allNotes.length === 0 
                  ? 'Start adding notes to your plants to track their progress!' 
                  : 'Try a different filter or add more notes to your plants.'}
              </p>
              <Link
                href="/list"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium active:bg-primary/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                View Plants
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4 pb-nav-safe">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="scroll-card"
                >
                  <Link href={`/plant/${note.plantId}`}>
                    <div className="p-4 bg-card/80 backdrop-blur-md shadow-sm border border-border cursor-pointer active:bg-accent transition-colors relative rounded-xl mobile-list-item mobile-touch-optimized">
                      <div className="flex items-start gap-3">
                        {/* Plant Icon */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: note.plantIconColor + '20', color: note.plantIconColor }}
                        >
                          {note.plantIcon}
                        </div>

                        {/* Note Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground text-sm truncate">
                                {note.plantName}
                              </h3>
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                Note
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                {note.timestamp}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {note.displayTime}
                              </div>
                            </div>
                          </div>

                          {/* Note Text */}
                          {note.text && (
                            <p className="text-sm text-foreground mb-3 line-clamp-3">
                              {note.text}
                            </p>
                          )}

                          {/* Note Images */}
                          {note.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {note.images.slice(0, 2).map((imageId, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className="relative bg-muted rounded-lg overflow-hidden aspect-square"
                                >
                                  <ImageDisplay
                                    imageId={imageId}
                                    alt={`Note image ${imgIndex + 1}`}
                                    width={150}
                                    height={150}
                                    className="w-full h-full object-cover"
                                  />
                                  {note.images.length > 2 && imgIndex === 1 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <span className="text-white text-sm font-medium">
                                        +{note.images.length - 2} more
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 