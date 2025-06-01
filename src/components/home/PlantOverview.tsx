'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plant } from '@/lib/plant-store';

interface PlantOverviewProps {
  plants: Plant[];
}

export function PlantOverview({ plants }: PlantOverviewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const getStatusColor = (status: Plant['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'needs_water':
        return 'text-orange-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Plant['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'needs_water':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'overdue':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const displayedPlants = plants.slice(0, 6);
  const hasMorePlants = plants.length > 6;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">Your Plants</h3>
          <p className="text-muted-foreground">
            {plants.length} plant{plants.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        
        {hasMorePlants && (
          <Link href="/plants">
            <motion.button
              className="btn-ghost text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </Link>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {displayedPlants.map((plant) => (
          <motion.div key={plant.id} variants={itemVariants}>
            <Link href={`/plants/${plant.id}`}>
              <motion.div
                className="group card-glass p-6 h-full cursor-pointer overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Plant Icon */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${plant.iconColor}20` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {plant.icon}
                  </motion.div>
                  
                  <motion.div
                    className={`flex items-center gap-1 ${getStatusColor(plant.status)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getStatusIcon(plant.status)}
                  </motion.div>
                </div>

                {/* Plant Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {plant.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {plant.species}
                  </p>
                  
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Last watered:</span>
                      <span className="text-foreground">{plant.lastWatered}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Next watering:</span>
                      <span className={`font-medium ${getStatusColor(plant.status)}`}>
                        {plant.nextWatering}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <motion.div 
                  className="mt-4 pt-4 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(plant.status)}`}>
                    {getStatusIcon(plant.status)}
                    {plant.status === 'healthy' && 'Healthy'}
                    {plant.status === 'needs_water' && 'Needs Water'}
                    {plant.status === 'overdue' && 'Overdue'}
                  </span>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {hasMorePlants && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <Link href="/plants">
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All {plants.length} Plants
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
} 