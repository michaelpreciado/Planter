'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  const { addPlant } = usePlants();
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
      addPlant({
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm flex items-center justify-between px-6 py-4 pt-safe relative z-10 dark:bg-gray-800"
      >
        <motion.button
          onClick={() => {
            router.back();
            haptic.lightImpact();
          }}
          className="text-gray-700 p-2 -m-2 rounded-lg active:bg-gray-100 transition-colors btn-mobile dark:text-gray-300 dark:active:bg-gray-700"
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </motion.button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Plant</h1>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-4">
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
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
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
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Watering Frequency
            </label>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Every</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.wateringFrequency}
                </span>
                <span className="text-sm text-gray-600">
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
                <div className="flex justify-between text-xs text-gray-500 mt-2">
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <span className="text-sm font-medium text-gray-700">Photo Attachments</span>
                  <span className="text-xs text-gray-500">
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
                        className="relative bg-gray-100 rounded-xl overflow-hidden"
                        style={{ aspectRatio: '3/2' }}
                      >
                        <img
                          src={imageUrl}
                          alt={`Note attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNoteImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
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
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white active:from-green-600 active:to-emerald-600 shadow-lg'
              }`}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
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
            className="text-center text-xs text-gray-500 pb-4"
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