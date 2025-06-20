'use client';

import Link from 'next/link';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Plant Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Keep your plants happy and healthy
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/add-plant"
            className="block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ➕ Add Plant
          </Link>
          
          <Link 
            href="/list"
            className="block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            📋 View Plants
          </Link>
          
          <Link 
            href="/settings"
            className="block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ⚙️ Settings
          </Link>
        </div>
        
        <p className="text-sm text-gray-500">
          Emergency simple mode - all features available
        </p>
      </div>
    </div>
  );
} 