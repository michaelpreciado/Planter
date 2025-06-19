/**
 * Modern Image Processing Hook
 * Handles image upload, compression, and validation with clean error handling
 */

import { useCallback, useState } from 'react';

interface ImageProcessorConfig {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

interface ProcessedImage {
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

const defaultConfig: Required<ImageProcessorConfig> = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1200,
  quality: 0.8,
  outputFormat: 'jpeg',
};

export function useImageProcessor(config: ImageProcessorConfig = {}) {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });

  const finalConfig = { ...defaultConfig, ...config };

  const processImage = useCallback(async (file: File): Promise<ProcessedImage> => {
    setState({ isProcessing: true, progress: 0, error: null });

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (file.size > finalConfig.maxSizeMB * 1024 * 1024) {
        throw new Error(`Image must be smaller than ${finalConfig.maxSizeMB}MB`);
      }

      setState(prev => ({ ...prev, progress: 10 }));

      // Create image element
      const img = await createImageElement(file);
      setState(prev => ({ ...prev, progress: 30 }));

      // Check if compression is needed
      const needsCompression = 
        img.width > finalConfig.maxWidthOrHeight ||
        img.height > finalConfig.maxWidthOrHeight ||
        file.size > 500 * 1024; // 500KB

      let result: ProcessedImage;

      if (needsCompression) {
        result = await compressImage(img, file, finalConfig);
        setState(prev => ({ ...prev, progress: 80 }));
      } else {
        // Use original file
        const dataUrl = await fileToDataUrl(file);
        result = {
          dataUrl,
          size: file.size,
          width: img.width,
          height: img.height,
          format: file.type,
        };
        setState(prev => ({ ...prev, progress: 80 }));
      }

      setState(prev => ({ ...prev, progress: 100, isProcessing: false }));
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setState({ isProcessing: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, [finalConfig]);

  const reset = useCallback(() => {
    setState({ isProcessing: false, progress: 0, error: null });
  }, []);

  return {
    processImage,
    reset,
    ...state,
  };
}

// Helper functions
async function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    img.src = URL.createObjectURL(file);
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.readAsDataURL(file);
  });
}

async function compressImage(
  img: HTMLImageElement, 
  originalFile: File, 
  config: Required<ImageProcessorConfig>
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // Calculate new dimensions
      const { width, height } = calculateDimensions(
        img.width, 
        img.height, 
        config.maxWidthOrHeight
      );

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to data URL
      const mimeType = `image/${config.outputFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, config.quality);

      // Clean up
      canvas.remove();
      URL.revokeObjectURL(img.src);

      resolve({
        dataUrl,
        size: Math.ceil(dataUrl.length * 0.75), // Estimate actual size
        width,
        height,
        format: mimeType,
      });

    } catch (error) {
      reject(new Error('Image compression failed'));
    }
  });
}

function calculateDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxSize: number
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / ratio),
    };
  } else {
    return {
      width: Math.round(maxSize * ratio),
      height: maxSize,
    };
  }
} 