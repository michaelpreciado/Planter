'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useMobileGestures';
import { TamagotchiColorPicker } from './TamagotchiColorPicker';
import { useTamagotchiStore } from '@/lib/tamagotchi-store';

interface SettingsDropdownProps {
  className?: string;
}

export function SettingsDropdown({ className = '' }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [weatherSync, setWeatherSync] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const haptic = useHapticFeedback();
  const { settings } = useTamagotchiStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    haptic.lightImpact();
  };

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(!value);
    haptic.lightImpact();
  };

  const handleMenuClick = (item: string) => {
    haptic.lightImpact();
    
    if (item === 'Tamagotchi Color') {
      setShowColorPicker(true);
      setIsOpen(false); // Close the dropdown
    } else {
      // TODO: Implement other menu item actions
      console.log(`Clicked: ${item}`);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Gear Icon Button */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full bg-white/40 backdrop-blur border border-white/20 shadow-lg hover:bg-white/50 transition-colors"
        aria-label="Settings"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </motion.svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🌱</span>
                </div>
              </div>
            </div>

            {/* Settings Options */}
            <div className="py-2">
              {/* Toggle Settings */}
              <div className="px-6 py-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-900 font-medium">Reminders</span>
                  <button
                    onClick={() => handleToggle(setReminders, reminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reminders ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.span
                      animate={{ x: reminders ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-900 font-medium">Notifications</span>
                  <button
                    onClick={() => handleToggle(setNotifications, notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.span
                      animate={{ x: notifications ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">Weather Sync</span>
                  <button
                    onClick={() => handleToggle(setWeatherSync, weatherSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      weatherSync ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.span
                      animate={{ x: weatherSync ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-6 my-2" />

              {/* Menu Items */}
              <div className="px-6 py-2">
                <button
                  onClick={() => handleMenuClick('Tamagotchi Color')}
                  className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="text-gray-900 font-medium">Tamagotchi Color</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: settings.color }}
                    />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => handleMenuClick('Data Export')}
                  className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="text-gray-900 font-medium">Data Export</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleMenuClick('Theme')}
                  className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="text-gray-900 font-medium">Theme</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handleMenuClick('About')}
                  className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <span className="text-gray-900 font-medium">About</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Picker Modal */}
      <TamagotchiColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
      />
    </div>
  );
} 