'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plant } from '@/lib/plant-store';
import { WaterAnimation } from './WaterAnimation';
import { ImageDisplay } from './ImageDisplay';
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
  // Swipe functionality disabled - users must use buttons instead
  console.warn('SwipeableListItem swipe functionality has been disabled. Use regular buttons instead.');

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
    <div className="relative bg-white rounded-xl p-4 mx-4 my-2 shadow-sm border border-gray-200">
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
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {plant.imageUrl ? (
                <ImageDisplay
                  imageId={plant.imageUrl}
                  alt={plant.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-full"
                  fallback={
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                    >
                      {plant.icon}
                    </div>
                  }
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                >
                  {plant.icon}
                </div>
              )}
            </div>

            {/* Plant Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">{plant.name}</h3>
              <p className="text-sm text-gray-600 capitalize mb-2">{plant.species}</p>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(plant.status)}`}>
                {getStatusText(plant.status)}
              </div>

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
        </div>
      </Link>

      {/* Action Buttons - Always Visible */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <motion.button
          onClick={() => onWater(plant.id)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
          Water
        </motion.button>
        
        <motion.button
          onClick={() => onDelete(plant.id)}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete
        </motion.button>
      </div>
    </div>
  );
} 