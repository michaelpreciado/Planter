'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';

export default function SimplePage() {
  const [mounted, setMounted] = useState(false);
  const { plants, addPlant, waterPlant } = usePlants();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  const handleAddSamplePlant = async () => {
    await addPlant({
      name: 'Test Plant',
      species: 'succulent',
      wateringFrequency: 7,
      notes: 'Added from simple page',
      plantingDate: new Date().toISOString(),
    });
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        🌱 Plant Tracker - Simple Mode
      </h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p>Total Plants: <strong>{plants.length}</strong></p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button 
          onClick={handleAddSamplePlant}
          style={{
            padding: '12px 20px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Add Sample Plant
        </button>
        
        <Link 
          href="/"
          style={{
            display: 'block',
            padding: '12px 20px',
            backgroundColor: '#3B82F6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            textAlign: 'center'
          }}
        >
          Go to Main App
        </Link>
      </div>

      {plants.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Your Plants:</h2>
          {plants.map((plant) => (
            <div 
              key={plant.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                    {plant.icon} {plant.name}
                  </h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    Status: {plant.status} | Next: {plant.nextWatering}
                  </p>
                </div>
                <button
                  onClick={() => waterPlant(plant.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#06B6D4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  💧 Water
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Emergency Mode</h3>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          This is a simplified version of the app that works without complex loading logic.
          If you're experiencing issues with the main app, you can use this page as a backup.
        </p>
      </div>
    </div>
  );
} 