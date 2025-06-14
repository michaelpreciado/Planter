'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { calculateHydrationPercentage, getStatusFromHydration, getSpriteForStatus, type Status } from '@/utils/hydration';

export interface PlantAvatarProps {
  lastWatered: string | Date;
  nextWaterDue: string | Date;
  size?: number;
  onStatusChange?: (status: Status) => void;
}

export const PlantAvatar = memo(({ 
  lastWatered, 
  nextWaterDue, 
  size = 64, 
  onStatusChange 
}: PlantAvatarProps) => {
  const [status, setStatus] = useState<Status>("happy");
  const [hydrationPercent, setHydrationPercent] = useState<number>(100);

  const updateHydrationStatus = useCallback(() => {
    const newHydrationPercent = calculateHydrationPercentage(lastWatered, nextWaterDue);
    const newStatus = getStatusFromHydration(newHydrationPercent);
    
    setHydrationPercent(newHydrationPercent);
    
    if (newStatus !== status) {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    }
  }, [lastWatered, nextWaterDue, status, onStatusChange]);

  // Update hydration on mount and dependencies change
  useEffect(() => {
    updateHydrationStatus();
  }, [updateHydrationStatus]);

  // Update hydration every 5 minutes
  useEffect(() => {
    const interval = setInterval(updateHydrationStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateHydrationStatus]);

  const spriteUrl = getSpriteForStatus(status);

  return (
    <div 
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <Image
        src={spriteUrl}
        alt={`Plant avatar - ${status}`}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'crisp-edges'
        }}
        priority={size > 100}
        aria-label={status}
      />
      
      {/* Optional hydration indicator */}
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center font-bold"
        style={{
          backgroundColor: hydrationPercent >= 50 ? '#10B981' : hydrationPercent >= 25 ? '#F59E0B' : '#EF4444',
          color: 'white',
          fontSize: '8px'
        }}
        title={`${hydrationPercent}% hydrated`}
      >
        {hydrationPercent}
      </div>
    </div>
  );
});

PlantAvatar.displayName = 'PlantAvatar'; 