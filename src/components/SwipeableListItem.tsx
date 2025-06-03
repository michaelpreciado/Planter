'use client';

import { motion, PanInfo, useAnimation } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Plant } from '@/lib/plant-store';
import { WaterAnimation } from './WaterAnimation';
import { format } from 'date-fns';

interface SwipeableListItemProps {
  plant: Plant;
  onWater: (id: string) => void;
  onDelete: (id: string) => void;
  showWaterAnimation: boolean;
  onWaterAnimationComplete: () => void;
}

export function SwipeableListItem({ 
  plant, 
  onWater, 
  onDelete, 
  showWaterAnimation, 
  onWaterAnimationComplete 
}: SwipeableListItemProps) {
  const [swipeState, setSwipeState] = useState<'none' | 'water' | 'delete'>('none');
  const [isRevealed, setIsRevealed] = useState(false);
  const controls = useAnimation();

  const handlePan = (event: any, info: PanInfo) => {
    const threshold = 80;
    const maxSwipe = 120;
    
    if (info.offset.x > threshold && info.offset.x < maxSwipe) {
      setSwipeState('water');
      controls.set({ x: Math.min(info.offset.x, maxSwipe) });
    } else if (info.offset.x < -threshold && info.offset.x > -maxSwipe) {
      setSwipeState('delete');
      controls.set({ x: Math.max(info.offset.x, -maxSwipe) });
    } else if (Math.abs(info.offset.x) < threshold) {
      setSwipeState('none');
      controls.set({ x: info.offset.x });
    }
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const threshold = 80;
    
    if (info.offset.x > threshold && swipeState === 'water') {
      // Trigger water action
      onWater(plant.id);
      setIsRevealed(false);
      controls.start({ x: 0 });
    } else if (info.offset.x < -threshold && swipeState === 'delete') {
      // Trigger delete action
      onDelete(plant.id);
      setIsRevealed(false);
      controls.start({ x: 0 });
    } else {
      // Snap back
      setSwipeState('none');
      setIsRevealed(false);
      controls.start({ x: 0 });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_water': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'needs_water': return 'Needs Water';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Water Action (Left Swipe) */}
        <motion.div
          className="flex items-center gap-2 text-blue-600"
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: swipeState === 'water' ? 1 : 0,
            x: swipeState === 'water' ? 0 : -20
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <span className="font-medium">Water</span>
        </motion.div>

        {/* Delete Action (Right Swipe) */}
        <motion.div
          className="flex items-center gap-2 text-red-600"
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: swipeState === 'delete' ? 1 : 0,
            x: swipeState === 'delete' ? 0 : 20
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-medium">Delete</span>
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <motion.div
        className="mobile-card rounded-xl p-4 mx-4 my-2 relative z-10 cursor-pointer"
        animate={controls}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        whileTap={{ scale: 0.98 }}
      >
        {/* Water Animation Overlay */}
        <WaterAnimation 
          isVisible={showWaterAnimation}
          onComplete={onWaterAnimationComplete}
          size="small"
        />

        <Link href={`/plant/${plant.id}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Plant Image/Icon */}
              <motion.div 
                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {plant.imageUrl ? (
                  <img
                    src={plant.imageUrl}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                  >
                    {plant.icon}
                  </div>
                )}
              </motion.div>

              {/* Plant Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-lg">{plant.name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-2">{plant.species}</p>
                
                {/* Status Badge */}
                <motion.div 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(plant.status)}`}
                  whileHover={{ scale: 1.05 }}
                >
                  {getStatusText(plant.status)}
                </motion.div>

                {/* Watering Info */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Last: {plant.lastWatered === 'Just planted' ? 'Just planted' : format(new Date(plant.lastWatered!), 'MMM dd')}</span>
                  <span>Next: {plant.nextWatering}</span>
                </div>

                {/* Notes Preview */}
                {plant.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">{plant.notes}</p>
                )}
              </div>
            </div>

            {/* Swipe Hint Indicator */}
            <motion.div
              className="flex flex-col items-center justify-center p-2 text-gray-400"
              animate={{ 
                opacity: swipeState !== 'none' ? 0 : 1,
                scale: swipeState !== 'none' ? 0.8 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-xs mt-1">swipe</span>
            </motion.div>
          </div>
        </Link>
      </motion.div>

      {/* Swipe Progress Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: swipeState !== 'none' ? 1 : 0 }}
      >
        <motion.div
          className={`h-full ${swipeState === 'water' ? 'bg-blue-500' : 'bg-red-500'}`}
          initial={{ width: 0 }}
          animate={{ 
            width: swipeState !== 'none' ? '100%' : 0
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
} 