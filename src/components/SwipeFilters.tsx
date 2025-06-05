'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface FilterOption {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface SwipeFiltersProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function SwipeFilters({ filters, activeFilter, onFilterChange }: SwipeFiltersProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const activeIndex = filters.findIndex(f => f.key === activeFilter);
  const filterWidth = containerWidth / Math.min(filters.length, 3);

  const handleDrag = (event: any, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = filterWidth / 3;
    let newIndex = activeIndex;

    if (Math.abs(info.velocity.x) > 500 || Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      } else if (info.offset.x < 0 && activeIndex < filters.length - 1) {
        newIndex = activeIndex + 1;
      }
    }

    onFilterChange(filters[newIndex].key);
    setDragOffset(0);
    controls.start({ x: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-white border-b border-gray-200 overflow-hidden"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="flex"
        style={{
          touchAction: 'pan-y',
          x: dragOffset,
        }}
      >
        {filters.map((filter, index) => {
          const isActive = filter.key === activeFilter;
          const offset = index - activeIndex;
          
          return (
            <motion.button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex-shrink-0 px-6 py-4 text-center transition-all duration-300
                ${isActive 
                  ? `text-white font-semibold ${filter.color}` 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              style={{ width: filterWidth }}
              animate={{
                scale: isActive ? 1.05 : Math.abs(offset) > 1 ? 0.9 : 0.95,
                opacity: Math.abs(offset) > 2 ? 0.3 : 1,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold">{filter.count}</span>
                <span className="text-xs font-medium">{filter.label}</span>
                
                {isActive && (
                  <motion.div
                    className="w-8 h-1 bg-white rounded-full mt-1"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      
      <div className="flex justify-center py-2 gap-1">
        {filters.map((_, index) => (
          <motion.div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === activeIndex ? 'bg-green-500' : 'bg-gray-300'
            }`}
            animate={{
              scale: index === activeIndex ? 1.2 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
} 