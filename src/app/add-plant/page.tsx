'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';
import { useHapticFeedback, useMobileGestures } from '@/hooks/useMobileGestures';
import { useVerticalScrollOptimization } from '@/hooks/useScrollOptimization';
import { ImageCapture } from '@/components/ImageCapture';
import { ImageDisplay } from '@/components/ImageDisplay';
import { ImageCaptureWithStorage } from '@/components/ImageCaptureWithStorage';
import { NightModeToggle } from '@/components/NightModeToggle';
import { PageLoader, PageHeader, PageContent } from '@/components/PageLoader';
import { usePageBasic } from '@/hooks/usePageReady';

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
  const { addPlant, error, loading, storeImage, removeImage } = usePlants();
  const haptic = useHapticFeedback();
  
  // Use professional page loading pattern
  const { isReady } = usePageBasic(400);

  // Scroll optimization
  const { scrollRef: formScrollRef, scrollToTop } = useVerticalScrollOptimization();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    wateringFrequency: 7,
    notes: '',
    noteAttachments: [] as string[],
    imageUrl: '',
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
      // Scroll to top to show any error messages
      scrollToTop();
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
        imageUrl: formData.imageUrl,
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

  const handleAddNoteImage = async (imageUrl: string) => {
    if (imageUrl) {
      try {
        // Store the image and get an ID back
        const imageId = await storeImage(imageUrl, undefined, Date.now().toString());
        setFormData(prev => ({
          ...prev,
          noteAttachments: [...prev.noteAttachments, imageId]
        }));
        haptic.success();
      } catch (error) {
        console.error('Failed to store note image:', error);
        haptic.error();
      }
    }
  };

  const handleRemoveNoteImage = async (index: number) => {
    const imageId = formData.noteAttachments[index];
    if (imageId) {
      try {
        await removeImage(imageId);
      } catch (error) {
        console.error('Failed to remove image from storage:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      noteAttachments: prev.noteAttachments.filter((_, i) => i !== index)
    }));
    haptic.lightImpact();
  };

  const handlePlantImageCapture = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imageId
    }));
    if (imageId) {
      haptic.success();
    }
  };

  // Show professional loader while page is preparing
  if (!isReady) {
    return <PageLoader message="Preparing plant form..." showProgress={true} />;
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
      <div 
        ref={formScrollRef}
        className="flex-1 overflow-y-auto mobile-scroll-container"
        style={{
          touchAction: 'pan-y',
        }}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Plant Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="scroll-card"
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
            className="scroll-card"
          >
            <label className="block text-sm font-medium text-foreground mb-4">
              Plant Type *
            </label>
            <div className="grid grid-cols-2 gap-3 scroll-card">
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
            className="scroll-card"
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

          {/* Plant Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="scroll-card"
          >
            <label className="block text-sm font-medium text-foreground mb-4">
              Plant Photo (Optional)
            </label>
            <ImageCaptureWithStorage
              onImageCapture={handlePlantImageCapture}
              currentImageId={formData.imageUrl}
              placeholder="Add a photo of your plant"
            />
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="scroll-card"
          >
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Notes & Additional Photos (Optional)
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
                    {formData.noteAttachments.map((imageId, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-muted rounded-xl overflow-hidden"
                        style={{ aspectRatio: '3/2' }}
                      >
                        <ImageDisplay
                          imageId={imageId}
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
            transition={{ delay: 0.7 }}
            className="pt-4 pb-nav-safe"
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
            className="text-center text-xs text-muted-foreground pb-nav-safe"
          >
            👉 Swipe right to go back
          </motion.div>
        </form>
      </div>
    </div>
  );
} 