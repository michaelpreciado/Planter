'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getImage } from '@/utils/imageStorage';
import { ImageErrorBoundary } from './ImageErrorBoundary';

interface ImageDisplayProps {
  imageId?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

interface ImageState {
  status: 'loading' | 'loaded' | 'error' | 'not-found';
  imageUrl: string | null;
  error: string | null;
}

export function ImageDisplay({
  imageId,
  alt = "Image",
  width = 400,
  height = 300,
  className = "",
  fallback,
  onLoad,
  onError,
}: ImageDisplayProps) {
  const [state, setState] = useState<ImageState>({
    status: 'loading',
    imageUrl: null,
    error: null,
  });

  const loadImage = useCallback(async (id: string) => {
    console.log('🖼️ ImageDisplay: Loading image with ID:', id);
    setState({ status: 'loading', imageUrl: null, error: null });

    try {
      const imageData = await getImage(id);
      console.log('🖼️ ImageDisplay: Image data received:', imageData ? `${imageData.substring(0, 50)}...` : 'null');
      
      if (!imageData) {
        console.warn('🖼️ ImageDisplay: No image data found for ID:', id);
        setState({ status: 'not-found', imageUrl: null, error: 'Image not found' });
        onError?.('Image not found');
        return;
      }

      // Validate image data
      if (!imageData.startsWith('data:image/')) {
        console.error('🖼️ ImageDisplay: Invalid image format for ID:', id, 'Data starts with:', imageData.substring(0, 20));
        throw new Error('Invalid image format');
      }

      console.log('✅ ImageDisplay: Image loaded successfully for ID:', id);
      setState({ status: 'loaded', imageUrl: imageData, error: null });
      onLoad?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load image';
      console.error('❌ ImageDisplay: Failed to load image ID:', id, 'Error:', errorMessage);
      setState({ status: 'error', imageUrl: null, error: errorMessage });
      onError?.(errorMessage);
    }
  }, [onLoad, onError]);

  useEffect(() => {
    if (!imageId) {
      console.log('🖼️ ImageDisplay: No image ID provided');
      setState({ status: 'not-found', imageUrl: null, error: null });
      return;
    }

    console.log('🖼️ ImageDisplay: useEffect triggered for image ID:', imageId);

    // Handle direct URLs
    if (imageId.startsWith('data:') || imageId.startsWith('http') || imageId.startsWith('blob:')) {
      console.log('🖼️ ImageDisplay: Using direct URL for image ID:', imageId.substring(0, 50));
      setState({ status: 'loaded', imageUrl: imageId, error: null });
      onLoad?.();
      return;
    }

    // Load from storage
    loadImage(imageId);
  }, [imageId, loadImage, onLoad]);

  // Loading state
  if (state.status === 'loading') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading image...</span>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (state.status === 'error' || state.status === 'not-found') {
    console.log('🖼️ ImageDisplay: Showing fallback for state:', state.status, 'Error:', state.error);
    
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p className="text-xs text-gray-400 text-center">
          {state.status === 'not-found' ? 'No image' : 'Failed to load'}
        </p>
        {state.error && (
          <p className="text-xs text-red-400 text-center mt-1">
            {state.error}
          </p>
        )}
      </div>
    );
  }

  // Success state
  if (state.status === 'loaded' && state.imageUrl) {
    console.log('✅ ImageDisplay: Rendering image successfully');
    return (
      <Image
        src={state.imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={(e) => {
          console.error('❌ ImageDisplay: Image render failed:', e);
          setState(prev => ({ ...prev, status: 'error', error: 'Image render failed' }));
          onError?.('Image render failed');
        }}
        onLoad={() => {
          console.log('✅ ImageDisplay: Image rendered successfully');
        }}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyxxxP2xbYp8CfHPH/PiGd+6v0wn/PQ/9k="
      />
    );
  }

  return null;
}

// Export wrapped component with error boundary
export function ImageDisplayWrapper(props: ImageDisplayProps) {
  return (
    <ImageErrorBoundary
      fallback={
        <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${props.className || ''}`}>
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <p className="text-xs text-gray-400">Image unavailable</p>
          </div>
        </div>
      }
    >
      <ImageDisplay {...props} />
    </ImageErrorBoundary>
  );
} 