'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { ImageDisplay } from './ImageDisplay';
import { storeImage, removeImage } from '@/utils/imageStorage';

interface ImageUploadProps {
  currentImageId?: string;
  onImageChange: (imageId: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  currentImageId,
  onImageChange,
  placeholder = "Add Photo",
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    processImage,
    isProcessing,
    progress,
    error: processingError,
    reset: resetProcessor,
  } = useImageProcessor({
    maxSizeMB: 3,
    maxWidthOrHeight: 1200,
    quality: 0.85,
  });

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
    
    if (!file) {
      setShowOptions(false);
      return;
    }

    setShowOptions(false);
    setUploadError(null);
    resetProcessor();

    try {
      // Process the image
      const processedImage = await processImage(file);
      
      // Store in our storage system
      const imageId = await storeImage(processedImage.dataUrl);
      
      // Remove old image if exists
      if (currentImageId) {
        try {
          await removeImage(currentImageId);
        } catch (error) {
          console.warn('Failed to remove old image:', error);
        }
      }
      
      // Update parent
      onImageChange(imageId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
    }
  }, [processImage, currentImageId, onImageChange, resetProcessor]);

  const handleRemoveImage = useCallback(async () => {
    if (currentImageId) {
      try {
        await removeImage(currentImageId);
        onImageChange('');
      } catch (error) {
        setUploadError('Failed to remove image');
      }
    }
    setShowOptions(false);
  }, [currentImageId, onImageChange]);

  const openFileSelector = useCallback((isCamera: boolean) => {
    const input = isCamera ? cameraInputRef.current : fileInputRef.current;
    if (input && !disabled) {
      input.click();
    }
  }, [disabled]);

  const toggleOptions = useCallback(() => {
    if (!disabled) {
      setShowOptions(prev => !prev);
      setUploadError(null);
    }
  }, [disabled]);

  return (
    <div className={`relative ${className}`}>
      {/* Error Display */}
      <AnimatePresence>
        {(uploadError || processingError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">
                {uploadError || processingError}
              </p>
              <button
                type="button"
                onClick={() => {
                  setUploadError(null);
                  resetProcessor();
                }}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Upload Area */}
      <motion.div
        onClick={toggleOptions}
        className={`
          relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer 
          hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{ aspectRatio: '4/3' }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        {currentImageId ? (
          <ImageDisplay
            imageId={currentImageId}
            alt="Uploaded image"
            width={800}
            height={600}
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
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

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xs w-full mx-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Processing image...
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {progress}% complete
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Indicator */}
        {currentImageId && !isProcessing && (
          <div className="absolute top-2 right-2">
            <div className="bg-black bg-opacity-50 rounded-full p-1.5">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {currentImageId ? 'Update Photo' : 'Add Photo'}
              </h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => openFileSelector(true)}
                  className="w-full flex items-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  </svg>
                  Take Photo
                </button>
                
                <button
                  type="button"
                  onClick={() => openFileSelector(false)}
                  className="w-full flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Choose from Gallery
                </button>
                
                {currentImageId && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-full flex items-center gap-3 p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Remove Photo
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowOptions(false)}
                  className="w-full p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 