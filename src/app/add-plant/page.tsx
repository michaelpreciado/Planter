'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';
import { useHapticFeedback, useMobileGestures } from '@/hooks/useMobileGestures';
import { ImageCapture } from '@/components/ImageCapture';
import { BottomNavigation } from '@/components/BottomNavigation';
import { NightModeToggle } from '@/components/NightModeToggle';

const plantTypes = [
  { id: 'succulent', name: 'Succulent', icon: '🌵' },
  { id: 'herb', name: 'Herb', icon: '🌿' },
  { id: 'flower', name: 'Flower', icon: '🌸' },
  { id: 'vegetable', name: 'Vegetable', icon: '🥬' },
  { id: 'tree', name: 'Tree', icon: '🌳' },
  { id: 'fern', name: 'Fern', icon: '🌿' },
  { id: 'cactus', name: 'Cactus', icon: '🌵' },
  { id: 'tropical', name: 'Tropical', icon: '🌺' },
];

export default function AddPlantPage() {
  const router = useRouter();
  const { addPlant, error, loading, hasHydrated } = usePlants();
  const haptic = useHapticFeedback();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    wateringFrequency: 7,
    notes: '',
    noteAttachments: [] as string[],
  });
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile gestures for navigation
  useMobileGestures({
    onSwipeRight: () => {
      router.back();
      haptic.lightImpact();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !selectedType) {
      haptic.error();
      return;
    }

    setIsSubmitting(true);
    haptic.mediumImpact();

    try {
      await addPlant({
        name: formData.name.trim(),
        species: selectedType,
        wateringFrequency: formData.wateringFrequency,
        notes: formData.notes.trim(),
        noteAttachments: formData.noteAttachments,
        plantingDate: new Date().toISOString(),
      });

      haptic.success();
      router.push('/list');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      haptic.error();
      setIsSubmitting(false);
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData(prev => ({ ...prev, species: typeId }));
    haptic.lightImpact();
  };

  const handleFrequencyChange = (value: number) => {
    setFormData(prev => ({ ...prev, wateringFrequency: value }));
    haptic.lightImpact();
  };

  const handleAddNoteImage = (imageUrl: string) => {
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        noteAttachments: [...prev.noteAttachments, imageUrl]
      }));
    }
    haptic.success();
  };

  const handleRemoveNoteImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      noteAttachments: prev.noteAttachments.filter((_, i) => i !== index)
    }));
    haptic.lightImpact();
  };

  // Show loading state while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm flex items-center justify-between px-6 py-4 pt-safe relative z-10"
        >
          <motion.button
            onClick={() => {
              router.back();
              haptic.lightImpact();
            }}
            className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors btn-mobile"
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </motion.button>
          <h1 className="text-xl font-bold text-foreground">Add New Plant</h1>
          <NightModeToggle />
        </motion.header>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <motion.div
              className="w-12 h-12 mx-auto text-green-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <div className="text-sm text-muted-foreground">Preparing plant form...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm flex items-center justify-between px-6 py-4 pt-safe relative z-10"
      >
        <motion.button
          onClick={() => {
            router.back();
            haptic.lightImpact();
          }}
          className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors btn-mobile"
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </motion.button>
        <h1 className="text-xl font-bold text-foreground">Add New Plant</h1>
        <NightModeToggle />
      </motion.header>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Plant Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Plant Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input input-mobile w-full touch-manipulation"
              placeholder="My beautiful plant"
              required
            />
          </motion.div>

          {/* Plant Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-foreground mb-4">
              Plant Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {plantTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 btn-mobile touch-feedback ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground active:bg-accent'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.name}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Watering Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-foreground mb-4">
              Watering Frequency
            </label>
            <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Every</span>
                <span className="text-2xl font-bold text-primary">
                  {formData.wateringFrequency}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formData.wateringFrequency === 1 ? 'day' : 'days'}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={formData.wateringFrequency}
                  onChange={(e) => handleFrequencyChange(parseInt(e.target.value))}
                  className="range-slider w-full touch-manipulation"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes & Photos (Optional)
            </label>
            <div className="space-y-4">
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input input-mobile w-full resize-none"
                rows={3}
                placeholder="Special care instructions, location, etc."
              />
              
              {/* Note Image Attachments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Photo Attachments</span>
                  <span className="text-xs text-muted-foreground">
                    {formData.noteAttachments.length}/5 photos
                  </span>
                </div>
                
                {/* Existing Attachments */}
                {formData.noteAttachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {formData.noteAttachments.map((imageUrl, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-muted rounded-xl overflow-hidden"
                        style={{ aspectRatio: '3/2' }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Note attachment ${index + 1}`}
                          width={400}
                          height={267}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNoteImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Add New Image */}
                {formData.noteAttachments.length < 5 && (
                  <div className="w-full" style={{ aspectRatio: '3/2' }}>
                    <ImageCapture
                      onImageCapture={handleAddNoteImage}
                      placeholder="Add Note Photo"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-destructive text-sm font-medium">Unable to save to database</p>
                  <p className="text-destructive/80 text-xs mt-1">
                    {error.includes('Database not configured') 
                      ? 'Your plant will be saved locally. To enable cloud sync, configure your database settings.'
                      : error
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4 pb-safe"
          >
            <motion.button
              type="submit"
              disabled={!formData.name.trim() || !selectedType || isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 btn-mobile ${
                !formData.name.trim() || !selectedType || isSubmitting
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground active:bg-primary/90 shadow-lg'
              }`}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Adding Plant...
                </div>
              ) : (
                <>🌱 Add Plant</>
              )}
            </motion.button>
          </motion.div>

          {/* Gesture Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="text-center text-xs text-muted-foreground pb-4"
          >
            👉 Swipe right to go back
          </motion.div>
        </form>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
} 