'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePlants } from '@/lib/plant-store';
import { WaterAnimation } from '@/components/WaterAnimation';
import { ImageCapture } from '@/components/ImageCapture';
import { TamagotchiBlob } from '@/components/TamagotchiBlob';
import { format, formatDistanceToNow } from 'date-fns';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getPlantById, waterPlant, updatePlant, recentlyWateredPlant, clearRecentlyWatered, plants, hasHydrated } = usePlants();
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');

  const plant = getPlantById(params.id as string);

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌱</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading plant details...</h2>
        </div>
      </div>
    );
  }

  // Show error only after hydration is complete
  if (!plant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plant not found</h2>
          <p className="text-gray-600 mb-4">Plant ID: {params.id}</p>
          <p className="text-gray-600 mb-4">Total plants in store: {plants.length}</p>
          <Link href="/list" className="text-green-600 hover:text-green-700">
            ← Back to plant list
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'needs_water': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      const currentNotes = plant.notes || '';
      const timestamp = format(new Date(), 'MMM dd');
      const noteEntry = `${timestamp}: ${newNote.trim()}`;
      const updatedNotes = currentNotes ? `${currentNotes}\n${noteEntry}` : noteEntry;
      
      updatePlant(plant.id, { notes: updatedNotes });
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const handleImageCapture = (imageUrl: string) => {
    updatePlant(plant.id, { imageUrl });
  };

  const getPlantHistory = () => {
    const history = [];
    
    // Add planting date
    history.push({
      date: plant.plantingDate,
      text: 'Planted',
      type: 'planted'
    });

    // Add watering if not just planted
    if (plant.lastWatered && plant.lastWatered !== 'Just planted') {
      history.push({
        date: plant.lastWatered,
        text: 'Watered',
        type: 'watered'
      });
    }

    // Add notes if any
    if (plant.notes) {
      const noteLines = plant.notes.split('\n').filter(line => line.trim());
      noteLines.forEach(note => {
        if (note.includes(':')) {
          const [datePart, ...textParts] = note.split(':');
          history.push({
            date: new Date().toISOString(), // Approximate date
            text: textParts.join(':').trim(),
            type: 'note'
          });
        }
      });
    }

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleWaterPlant = () => {
    if (plant) {
      waterPlant(plant.id);
      // Clear the animation after it completes
      setTimeout(() => {
        clearRecentlyWatered();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Water Animation */}
      <WaterAnimation 
        isVisible={recentlyWateredPlant === plant?.id}
        onComplete={() => clearRecentlyWatered()}
        size="large"
      />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 pt-safe"
      >
        <button onClick={() => router.back()} className="text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">{plant.name}</h1>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
        >
          {plant.icon}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-safe">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl p-6 mb-6"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Last Watered</span>
              <span className="text-gray-900">
                {plant.lastWatered === 'Just planted' 
                  ? 'Just planted' 
                  : formatDistanceToNow(new Date(plant.lastWatered!), { addSuffix: true })
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Next Watering</span>
              <span className="text-gray-900">{plant.nextWatering}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Health Status</span>
              <span className={`font-semibold ${getStatusColor(plant.status)}`}>
                {getStatusText(plant.status)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Plant Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ImageCapture
            onImageCapture={handleImageCapture}
            currentImage={plant.imageUrl}
            placeholder="Add a photo of your plant"
          />
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">History</h2>
            <button
              onClick={() => setShowAddNote(true)}
              className="text-green-600 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Note
            </button>
          </div>

          {/* Add Note Form */}
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-50 rounded-lg p-4 mb-4"
            >
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about your plant..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddNote}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Save Note
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* History Timeline */}
          <div className="space-y-3">
            {getPlantHistory().map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex justify-between items-center"
              >
                <span className="text-gray-600 font-medium">
                  {format(new Date(entry.date), 'MMM dd')}
                </span>
                <span className="text-gray-900">{entry.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Cute Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="flex justify-end mt-6"
          >
            <div className="w-16 h-16">
              <TamagotchiBlob size={64} showAnimation={false} />
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <button
            onClick={handleWaterPlant}
            className="bg-blue-500 text-white py-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            Water Plant
          </button>
          <Link
            href="/list"
            className="bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            View All Plants
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 