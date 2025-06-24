'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TamagotchiBlob } from './TamagotchiBlob';
import { useTamagotchiStore, TAMAGOTCHI_COLORS, getColorFilter } from '@/lib/tamagotchi-store';
import { useHapticFeedback } from '@/hooks/useMobileGestures';

interface TamagotchiColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TamagotchiColorPicker: React.FC<TamagotchiColorPickerProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateColor } = useTamagotchiStore();
  const [selectedColor, setSelectedColor] = useState(settings.color);
  const haptic = useHapticFeedback();

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    haptic.lightImpact();
  };

  const handleSave = () => {
    updateColor(selectedColor);
    haptic.mediumImpact();
    onClose();
  };

  const handleCancel = () => {
    setSelectedColor(settings.color);
    haptic.lightImpact();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-white/20 dark:border-white/10" style={{ maxHeight: '80vh' }}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-white/10 to-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Choose Color</h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="px-6 py-8 bg-gradient-to-br from-white/5 via-white/10 to-white/5">
                <div className="flex justify-center mb-4">
                  <div 
                    className="relative"
                    style={{
                      filter: getColorFilter(selectedColor),
                    }}
                  >
                    <TamagotchiBlob size={120} showAnimation={false} />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Preview: {TAMAGOTCHI_COLORS.find(c => c.value === selectedColor)?.name}
                </p>
              </div>

              {/* Color Grid */}
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Select a color:</h3>
                <div className="grid grid-cols-5 gap-3">
                  {TAMAGOTCHI_COLORS.map((color) => (
                    <motion.button
                      key={color.value}
                      onClick={() => handleColorSelect(color.value)}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.value
                          ? 'border-gray-800 shadow-lg scale-110'
                          : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      whileTap={{ scale: 0.95 }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color Names Grid for better accessibility */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {TAMAGOTCHI_COLORS.map((color, index) => (
                    <div key={color.value} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-200" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-white/20 dark:border-white/10 bg-white/5">
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Save Color
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 