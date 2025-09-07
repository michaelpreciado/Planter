'use client';

import React, { memo, useMemo, useEffect, useRef } from 'react';
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
  // Optimize by computing status and hydration directly instead of storing in state
  const hydrationPercent = useMemo(() => {
    return calculateHydrationPercentage(lastWatered, nextWaterDue);
  }, [lastWatered, nextWaterDue]);

  const status = useMemo(() => {
    return getStatusFromHydration(hydrationPercent);
  }, [hydrationPercent]);

  // Only call onStatusChange when status actually changes
  const prevStatusRef = useRef<Status | null>(null);
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      onStatusChange?.(status);
      prevStatusRef.current = status;
    }
  }, [status, onStatusChange]);

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
      
      {/* Optional hydration indicator - optimized with memoized styles */}
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center font-bold"
        style={useMemo(() => ({
          backgroundColor: hydrationPercent >= 50 ? '#10B981' : hydrationPercent >= 25 ? '#F59E0B' : '#EF4444',
          color: 'white',
          fontSize: '8px'
        }), [hydrationPercent])}
        title={`${hydrationPercent}% hydrated`}
      >
        {hydrationPercent}
      </div>
    </div>
  );
});

PlantAvatar.displayName = 'PlantAvatar'; 