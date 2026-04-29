'use client';

import { useEffect, useState, useRef } from 'react';
import { ensureDevice } from '@/lib/deviceClient';
import V2Page from './page';
import { overdueHighPriority } from '@/lib/plantRepo';
import type { Plant } from '@/lib/schemas';

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deviceInfo, setDeviceInfo] = useState<{
    deviceId: string;
    ip: string;
    deviceName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const swRegistered = useRef(false);

  useEffect(() => {
    // Attempt to pair device on first load
    ensureDevice()
      .then((info) => {
        setDeviceInfo(info);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });

    // Register service worker
    if ('serviceWorker' in navigator && !swRegistered.current) {
      swRegistered.current = true;
      
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    }

    // Periodic check for overdue plants (every 60 seconds)
    const checkInterval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      
      try {
        const overduePlants = await overdueHighPriority();
        
        if (overduePlants.length > 0 && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_OVERDUE',
            plants: overduePlants,
          });
        }
      } catch (error) {
        console.error('Error checking overdue plants:', error);
      }
    }, 60000);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E07A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Setting up...</p>
        </div>
      </div>
    );
  }

  return <V2Page />;
}
