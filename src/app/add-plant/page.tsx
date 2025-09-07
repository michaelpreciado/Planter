'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';
import { useHapticFeedback, useMobileGestures } from '@/hooks/useMobileGestures';
import { useVerticalScrollOptimization } from '@/hooks/useScrollOptimization';
import { ImageUpload } from '@/components/ImageUpload';
import { AuthGuard } from '@/components/AuthGuard';

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
  const { addPlant, error, loading, storeImage, removeImage, hasHydrated } = usePlants();
  const haptic = useHapticFeedback();
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Scroll optimization
  const { scrollRef: formScrollRef, scrollToTop } = useVerticalScrollOptimization();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    wateringFrequency: 7,
    notes: '',
    imageUrl: '',
  });
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

    // Show confirmation step first
    if (!showConfirmation) {
      setShowConfirmation(true);
      haptic.lightImpact();
      return;
    }

    // Proceed with actual submission
    setIsSubmitting(true);
    haptic.mediumImpact();

    try {
      await addPlant({
        name: formData.name.trim(),
        species: selectedType,
        wateringFrequency: formData.wateringFrequency,
        notes: formData.notes.trim(),
        imageUrl: formData.imageUrl,
        plantingDate: new Date().toISOString(),
      });

      haptic.success();
      router.push('/list');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      haptic.error();
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
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

  const handlePlantImageCapture = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imageId
    }));
    if (imageId) {
      haptic.success();
    }
  };

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Preparing plant form...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard message="Please sign in to add new plants to your collection">
      <div className="min-h-screen bg-background flex flex-col ios-safe-layout mobile-content">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="top-header-fixed bg-transparent backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-4 pt-safe"
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
        <motion.button
          type="button"
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
        <div></div>
      </motion.header>

      {/* Form Content */}
      <div 
        ref={formScrollRef}
        className="flex-1 overflow-y-auto mobile-scroll-container content-with-header"
        style={{
          touchAction: 'pan-y',
        }}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-8" noValidate>
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
            <div className="grid grid-cols-4 gap-2 scroll-card">
              {plantTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeSelect(type.id)}
                  className={`aspect-square p-1.5 rounded-lg border-2 transition-all duration-200 btn-mobile touch-feedback flex flex-col items-center justify-center ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-foreground active:bg-accent'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xs mb-0.5">{type.icon}</div>
                  <div className="text-[9px] font-medium text-center leading-tight">{type.name}</div>
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
            <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 dark:border-white/10">
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
            <ImageUpload
              onImageChange={handlePlantImageCapture}
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
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input input-mobile w-full resize-none"
              rows={3}
              placeholder="Special care instructions, location, etc."
            />
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

          {/* Confirmation Preview */}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4"
            >
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                Ready to add your plant!
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Name:</span>
                  <span className="text-green-800 dark:text-green-100 font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Type:</span>
                  <span className="text-green-800 dark:text-green-100 font-medium capitalize">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 dark:text-green-300">Watering:</span>
                  <span className="text-green-800 dark:text-green-100 font-medium">
                    Every {formData.wateringFrequency} {formData.wateringFrequency === 1 ? 'day' : 'days'}
                  </span>
                </div>
                {formData.imageUrl && (
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Photo:</span>
                    <span className="text-green-800 dark:text-green-100 font-medium">✓ Added</span>
                  </div>
                )}
                {formData.notes && (
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Notes:</span>
                    <span className="text-green-800 dark:text-green-100 font-medium">✓ Added</span>
                  </div>
                )}
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
                  : showConfirmation
                  ? 'bg-green-600 text-white active:bg-green-700 shadow-lg animate-pulse'
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
              ) : showConfirmation ? (
                <>✅ Confirm Add Plant</>
              ) : (
                <>🌱 Add Plant</>
              )}
            </motion.button>

            {showConfirmation && (
              <motion.button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  haptic.lightImpact();
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-3 rounded-xl font-medium text-base text-muted-foreground active:bg-muted transition-all duration-200 btn-mobile mt-3"
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            )}
          </motion.div>

        </form>
        </div>
      </div>
    </AuthGuard>
  );
} 