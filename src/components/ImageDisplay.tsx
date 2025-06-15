'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePlants } from '@/lib/plant-store';

interface ImageDisplayProps {
  imageId?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImageDisplay({ 
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
  const { getImage } = usePlants();

  useEffect(() => {
    if (!imageId) {
      setImageData(null);
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getImage(imageId);
        setImageData(data);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError('Failed to load image');
        setImageData(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageId, getImage]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading...</span>
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
      onError={() => {
        setError('Failed to load image');
        setImageData(null);
      }}
    />
  );
} 