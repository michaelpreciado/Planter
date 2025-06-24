'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePlants } from '@/lib/plant-store';
import { WaterAnimation } from '@/components/WaterAnimation';
import { ImageCaptureWithStorage } from '@/components/ImageCaptureWithStorage';
import { ImageDisplay } from '@/components/ImageDisplay';
import { PlantAvatar } from '@/components/PlantAvatar';
import { format, formatDistanceToNow } from 'date-fns';
import { PageLoader } from '@/components/PageLoader';
import { usePageWithPlants } from '@/hooks/usePageReady';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPlantById, waterPlant, updatePlant, recentlyWateredPlant, clearRecentlyWatered, plants, storeImage, removeImage, hasHydrated, loading } = usePlants();
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const plant = getPlantById(params.id as string);

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading plant details...</p>
        </div>
      </div>
    );
  }

  // Show error only after hydration is complete
  if (!plant) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Plant not found</h2>
          <p className="text-muted-foreground mb-4">Plant ID: {params.id}</p>
          <p className="text-muted-foreground mb-4">Total plants in store: {plants.length}</p>
          <Link href="/list" className="text-primary hover:text-primary/80">
            ← Back to plant list
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'needs_water': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
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

  const handleAddNote = () => {
    if (newNote.trim() || noteImages.length > 0) {
      const currentNotes = plant.notes || '';
      const currentAttachments = plant.noteAttachments || [];
      const timestamp = format(new Date(), 'MMM dd, HH:mm');
      
      // Create a structured note entry
      const noteEntry = {
        id: Date.now().toString(),
        timestamp,
        text: newNote.trim(),
        images: [...noteImages] as string[]
      };
      
      // For backward compatibility, we'll store structured notes as JSON in the notes field
      // and individual images in noteAttachments
      let updatedNotes = '';
      try {
        const existingNotes = currentNotes ? JSON.parse(currentNotes) : [];
        const allNotes = Array.isArray(existingNotes) ? existingNotes : [];
        allNotes.push(noteEntry);
        updatedNotes = JSON.stringify(allNotes);
      } catch {
        // If parsing fails, convert old format to new
        const legacyNotes = currentNotes.split('\n').filter(line => line.trim()).map((line, index) => ({
          id: `legacy-${index}`,
          timestamp: line.includes(':') ? line.split(':')[0] : format(new Date(), 'MMM dd'),
          text: line.includes(':') ? line.split(':').slice(1).join(':').trim() : line,
          images: [] as string[]
        }));
        legacyNotes.push(noteEntry);
        updatedNotes = JSON.stringify(legacyNotes);
      }
      
      const updatedAttachments = [...currentAttachments, ...noteImages];
      
      updatePlant(plant.id, { 
        notes: updatedNotes,
        noteAttachments: updatedAttachments 
      });
      
      setNewNote('');
      setNoteImages([]);
      setShowAddNote(false);
    }
  };

  const handleAddNoteImage = async (imageId: string) => {
    if (imageId && noteImages.length < 3) {
      setNoteImages(prev => [...prev, imageId]);
    }
  };

  const handleRemoveNoteImage = async (index: number) => {
    const imageId = noteImages[index];
    if (imageId) {
      try {
        await removeImage(imageId);
      } catch (error) {
        console.error('Failed to remove image from storage:', error);
      }
    }
    setNoteImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageCapture = (imageId: string) => {
    updatePlant(plant.id, { imageUrl: imageId });
  };

  interface HistoryEntry {
    date: string;
    text: string;
    type: 'planted' | 'watered' | 'note';
    timestamp?: string;
    images?: string[];
  }

  const getPlantHistory = (): HistoryEntry[] => {
    const history: HistoryEntry[] = [];
    
    // Add planting date
    history.push({
      date: plant.plantingDate,
      text: 'Planted',
      type: 'planted'
    });

    // Add watering if not just planted
    if (plant.lastWatered && plant.lastWatered !== 'Just planted') {
      history.push({
        date: plant.lastWatered,
        text: 'Watered',
        type: 'watered'
      });
    }

    // Add notes if any
    if (plant.notes) {
      try {
        const notes = JSON.parse(plant.notes);
        if (Array.isArray(notes)) {
          notes.forEach((note: any) => {
            // Use the note's ID (which is Date.now().toString()) to get the actual creation time
            const creationDate = note.id && !note.id.startsWith('legacy-') 
              ? new Date(parseInt(note.id)).toISOString()
              : new Date().toISOString();
            
            history.push({
              date: creationDate,
              text: note.text || '',
              images: note.images || [],
              type: 'note',
              timestamp: note.timestamp
            });
          });
        } else {
          throw new Error('Not array format');
        }
      } catch {
        // Handle legacy format
        const noteLines = plant.notes.split('\n').filter(line => line.trim());
        noteLines.forEach((note, index) => {
          if (note.includes(':')) {
            const [datePart, ...textParts] = note.split(':');
            history.push({
              date: new Date(Date.now() - (noteLines.length - index) * 60000).toISOString(), // Stagger legacy notes by minutes
              text: textParts.join(':').trim(),
              type: 'note',
              timestamp: datePart
            });
          } else {
            history.push({
              date: new Date(Date.now() - (noteLines.length - index) * 60000).toISOString(),
              text: note,
              type: 'note',
              timestamp: format(new Date(), 'MMM dd')
            });
          }
        });
      }
    }

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleWaterPlant = () => {
    if (plant) {
      waterPlant(plant.id);
      // Clear the animation after it completes
      setTimeout(() => {
        clearRecentlyWatered();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col relative mobile-scroll-container">
      {/* Water Animation */}
      <WaterAnimation 
        isVisible={recentlyWateredPlant === plant?.id}
        onComplete={() => clearRecentlyWatered()}
        size="large"
      />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 pt-safe flex-shrink-0"
      >
        <button onClick={() => router.back()} className="text-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-foreground">{plant.name}</h1>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
        >
          {plant.icon}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-safe overflow-y-auto mobile-scroll momentum-scroll" style={{ touchAction: 'pan-y' }}>
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Next Watering</span>
              <span className="text-foreground">{plant.nextWatering}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Health Status</span>
              <span className={`font-semibold ${getStatusColor(plant.status)}`}>
                {getStatusText(plant.status)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Plant Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ImageCaptureWithStorage
            onImageCapture={handleImageCapture}
            currentImageId={plant.imageUrl}
            placeholder="Add a photo of your plant"
          />
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">History</h2>
            <button
              onClick={() => setShowAddNote(true)}
              className="text-primary font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Note
            </button>
          </div>

          {/* Add Note Form */}
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-muted dark:bg-gray-800 rounded-lg p-4 mb-4"
            >
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about your plant..."
                className="w-full px-3 py-2 border border-border bg-background dark:bg-gray-700 text-foreground rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              
              {/* Note Images */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Photos</span>
                  <span className="text-xs text-muted-foreground">
                    {noteImages.length}/3 photos
                  </span>
                </div>
                
                {/* Existing Images */}
                {noteImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {noteImages.map((imageId, index) => (
                      <div
                        key={index}
                        className="relative bg-muted dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                      >
                        <ImageDisplay
                          imageId={imageId}
                          alt={`Note image ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNoteImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add New Image */}
                {noteImages.length < 3 && (
                  <div className="aspect-square">
                    <ImageCaptureWithStorage
                      onImageCapture={handleAddNoteImage}
                      placeholder="Add Photo"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddNote}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                    setNoteImages([]);
                  }}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* History Timeline */}
          <div className="space-y-4">
            {getPlantHistory().map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-lg p-4 border border-white/20 dark:border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {entry.timestamp || format(new Date(entry.date), 'MMM dd')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    entry.type === 'planted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    entry.type === 'watered' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {entry.type === 'planted' ? 'Planted' : 
                     entry.type === 'watered' ? 'Watered' : 'Note'}
                  </span>
                </div>
                
                {entry.text && (
                  <p className="text-muted-foreground text-sm mb-3">{entry.text}</p>
                )}
                
                {/* Note Images */}
                {entry.images && entry.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {entry.images.map((imageId: string, imgIndex: number) => (
                      <div
                        key={imgIndex}
                        className="relative bg-muted dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                      >
                        <ImageDisplay
                          imageId={imageId}
                          alt={`Note image ${imgIndex + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Cute Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="flex justify-end mt-6"
          >
            <div className="w-16 h-16">
              {plant && (
                <PlantAvatar 
                  lastWatered={plant.lastWatered || new Date().toISOString()}
                  nextWaterDue={new Date(Date.now() + plant.wateringFrequency * 24 * 60 * 60 * 1000).toISOString()}
                  size={64}
                />
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Removed Action Buttons (Water Plant / View All Plants) */}
      </div>
    </div>
  );
} 