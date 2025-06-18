'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';
import { ImageErrorBoundary } from './ImageErrorBoundary';

interface ImageDisplayProps {
  imageId?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
}

function ImageDisplayCore({ 
  imageId, 
  alt = "Image", 
  width = 400, 
  height = 300, 
  className = "",
  fallback
}: ImageDisplayProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const { getImage } = usePlants();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!imageId) {
      setImageData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // If a full data URL or remote URL is provided, display it directly
    if (
      imageId.startsWith('data:image/') ||
      imageId.startsWith('http') ||
      imageId.startsWith('blob:')
    ) {
      setImageData(imageId);
      setLoading(false);
      setError(null);
      return;
    }

    // Skip loading until hydrated
    if (!isHydrated) {
      return;
    }

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading image with ID:', imageId);
        const data = await getImage(imageId);
        
        if (data) {
          // Validate that the data is a proper image URL
          if (data.startsWith('data:image/') || data.startsWith('http') || data.startsWith('blob:')) {
            console.log('Image loaded successfully:', imageId);
            setImageData(data);
            setLoading(false);
          } else {
            console.error('Invalid image data format for ID:', imageId, 'Data starts with:', data.substring(0, 50));
            throw new Error('Invalid image data format');
          }
        } else {
          console.error('Image not found for ID:', imageId);
          throw new Error('Image not found');
        }
      } catch (err) {
        console.error('Failed to load image:', imageId, err);
        
        // Retry logic for deployment issues
        if (retryCount < 2) {
          console.log(`Retrying image load for ${imageId}, attempt ${retryCount + 1}`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        setError('Failed to load image');
        setImageData(null);
        setLoading(false);
      }
    };

    loadImage();
  }, [imageId, getImage, retryCount, isHydrated]);

  // Reset retry count when imageId changes
  useEffect(() => {
    setRetryCount(0);
  }, [imageId]);

  // Show loading state during SSR or before hydration
  if (!isHydrated || loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">
            {!isHydrated ? 'Loading...' : (retryCount > 0 ? `Retrying... (${retryCount}/2)` : 'Loading...')}
          </span>
        </div>
      </div>
    );
  }

  if (error || !imageData) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-xs text-gray-400">{error || 'No image'}</p>
          {error && retryCount >= 2 && (
            <button 
              onClick={() => setRetryCount(0)}
              className="text-xs text-blue-500 hover:text-blue-600 mt-1"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imageData}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        console.error('Image render error:', e);
        setError('Failed to display image');
        setImageData(null);
      }}
      onLoad={() => {
        // Image loaded successfully, reset any error states
        setError(null);
      }}
      // Add loading strategy for better performance
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyxxxP2xbYp8CfHPH/PiGd+6v0wn/PQ/9k="
    />
  );
}

// Export wrapped component with error boundary
export function ImageDisplay(props: ImageDisplayProps) {
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
      <ImageDisplayCore {...props} />
    </ImageErrorBoundary>
  );
} 