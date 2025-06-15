'use client';

import { motion } from 'framer-motion';

interface Filter {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface SwipeFiltersProps {
  filters: Filter[];
  activeFilter: string;
  onFilterChange: (filterKey: string) => void;
}

export function SwipeFilters({ filters, activeFilter, onFilterChange }: SwipeFiltersProps) {
  // Swipe functionality disabled - users must use buttons instead
  console.warn('SwipeFilters swipe functionality has been disabled. Use regular buttons instead.');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex gap-2 p-4 overflow-x-auto">
        {filters.map((filter) => {
          const isActive = filter.key === activeFilter;
          
          return (
            <motion.button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex-shrink-0 px-6 py-4 text-center transition-all duration-300 rounded-lg
                ${isActive 
                  ? `text-white font-semibold ${filter.color}` 
                  : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold">{filter.count}</span>
                <span className="text-xs font-medium">{filter.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
} 