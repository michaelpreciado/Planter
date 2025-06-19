'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageDisplay } from './ImageDisplay';
import { usePlants } from '@/lib/plant-store';

interface ImageCaptureWithStorageProps {
  onImageCapture: (imageId: string) => void;
  currentImageId?: string;
  placeholder?: string;
}

// Enhanced image utilities with error handling
const imageUtils = {
  // Check if file is valid image
  isValidImage: (file: File): boolean => {
    return file.type.startsWith('image/');
  },

  // Check file size (5MB limit)
  isValidSize: (file: File): boolean => {
    return file.size <= 5 * 1024 * 1024;
  },

  // Simplified image processing that's more reliable
  processImage: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('📁 Starting file processing...');
      
      const reader = new FileReader();
      
      reader.onerror = () => {
        console.error('❌ FileReader error');
        reject(new Error('Failed to read file'));
      };
      
      reader.onload = (e) => {
        console.log('📄 File read successfully');
        const result = e.target?.result as string;
        
        if (!result) {
          console.error('❌ No result from FileReader');
          reject(new Error('Failed to read image data'));
          return;
        }

        // For now, let's skip the canvas compression and just use the original
        // This will help us identify if the issue is in canvas processing
        if (file.size > 2 * 1024 * 1024) { // Only compress if > 2MB
          console.log('🔄 File is large, attempting compression...');
          
          const img = new Image();
          img.onerror = () => {
            console.error('❌ Image load error');
            reject(new Error('Invalid image file'));
          };
          
          img.onload = () => {
            try {
              console.log('🖼️ Image loaded for compression');
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                console.error('❌ Canvas not supported');
                // Fallback to original image
                console.log('🔄 Falling back to original image');
                resolve(result);
                return;
              }
              
              // Simple compression - max 800px width/height
              const maxSize = 800;
              let { width, height } = img;
              
              if (width > maxSize || height > maxSize) {
                if (width > height) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                } else {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              ctx.drawImage(img, 0, 0, width, height);
              
              const compressed = canvas.toDataURL('image/jpeg', 0.8);
              console.log('✅ Compression complete');
              
              // Cleanup
              canvas.remove();
              
              resolve(compressed);
            } catch (error) {
              console.error('❌ Compression failed:', error);
              // Fallback to original
              resolve(result);
            }
          };
          
          img.src = result;
        } else {
          console.log('📁 File size OK, using original');
          resolve(result);
        }
      };
      
      reader.readAsDataURL(file);
    });
  }
};

export function ImageCaptureWithStorage({ onImageCapture, currentImageId, placeholder = "Add Photo" }: ImageCaptureWithStorageProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { storeImage, removeImage } = usePlants();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
    
    if (!file) {
      setShowOptions(false);
      return;
    }

    setIsCapturing(true);
    setError(null);
    setShowOptions(false);

    // Add a timeout to prevent infinite processing state
    const timeoutId = setTimeout(() => {
      console.error('❌ Image processing timeout');
      setError('Image processing timed out. Try a smaller image or different format.');
      setIsCapturing(false);
    }, 10000); // 10 second timeout

    try {
      // Validate file
      if (!imageUtils.isValidImage(file)) {
        throw new Error('Please select a valid image file');
      }

      if (!imageUtils.isValidSize(file)) {
        throw new Error('Image size must be less than 5MB');
      }

      // Process image
      console.log('🔄 Starting image processing...');
      let processedImage: string;
      
      try {
        processedImage = await imageUtils.processImage(file);
        console.log('✨ Image processing complete, result length:', processedImage.length);
      } catch (processingError) {
        console.warn('⚠️ Image processing failed, using simple fallback:', processingError);
        
        // Simple fallback - just read the file as data URL
        processedImage = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }
      
      // Store the image and get ID
      console.log('💾 Attempting to store image...');
      const imageId = await storeImage(processedImage);
      console.log('✅ Image stored successfully with ID:', imageId);
      
      // Remove old image if exists
      if (currentImageId) {
        try {
          await removeImage(currentImageId);
          console.log('🗑️ Old image removed:', currentImageId);
        } catch (error) {
          console.warn('Failed to remove old image:', error);
        }
      }
      
      // Call the callback with new image ID
      onImageCapture(imageId);
      console.log('📤 Image capture callback called with ID:', imageId);
      
    } catch (error) {
      console.error('Image processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      clearTimeout(timeoutId);
      setIsCapturing(false);
    }
  }, [onImageCapture, currentImageId, storeImage, removeImage]);

  const removeCurrentImage = useCallback(async () => {
    if (currentImageId) {
      try {
        await removeImage(currentImageId);
        onImageCapture('');
      } catch (error) {
        console.error('Failed to remove image:', error);
        setError('Failed to remove image');
      }
    }
    setShowOptions(false);
    clearError();
  }, [currentImageId, removeImage, onImageCapture, clearError]);

  const handleOptionsToggle = useCallback(() => {
    setShowOptions(prev => !prev);
    clearError();
  }, [clearError]);

  return (
    <div className="relative">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Image Display */}
      <motion.div
        onClick={handleOptionsToggle}
        className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        style={{ aspectRatio: '4/3' }}
        whileTap={{ scale: 0.98 }}
      >
        {currentImageId ? (
          <ImageDisplay
            imageId={currentImageId}
            alt="Plant photo"
            width={800}
            height={600}
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-xs">Failed to load</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-sm font-medium">{placeholder}</span>
            <span className="text-xs text-gray-400 mt-1">Tap to add photo</span>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Processing image...</span>
              </div>
              <button 
                onClick={() => {
                  console.log('🔄 Force reset processing state');
                  setIsCapturing(false);
                  setError('Processing cancelled');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Image Controls Overlay */}
        {currentImageId && !isCapturing && (
          <div className="absolute top-2 right-2">
            <div className="bg-black bg-opacity-50 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
          </div>
        )}
      </motion.div>

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowOptions(false)}
            />

            {/* Options Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  {currentImageId ? 'Update Photo' : 'Add Photo'}
                </h3>
                
                <div className="space-y-3">
                {/* Camera Option */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCapturing}
                  className="w-full bg-green-500 text-white py-4 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Take Photo
                </button>

                {/* Gallery Option */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCapturing}
                  className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Choose from Gallery
                </button>

                {/* Remove Option */}
                {currentImageId && (
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    disabled={isCapturing}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Remove Photo
                  </button>
                )}

                {/* Cancel Option */}
                <button
                  type="button"
                  onClick={() => setShowOptions(false)}
                  disabled={isCapturing}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select image from device"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Take photo with camera"
      />
    </div>
  );
} 