'use client';

import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { usePlantStore } from '@/lib/plant-store';

function SyncOrchestrator() {
  const processPendingSyncQueue = usePlantStore((state) => state.processPendingSyncQueue);
  const syncWithDatabase = usePlantStore((state) => state.syncWithDatabase);

  useEffect(() => {
    const handleOnline = async () => {
      await processPendingSyncQueue();
      await syncWithDatabase();
    };

    window.addEventListener('online', handleOnline);
    void handleOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processPendingSyncQueue, syncWithDatabase]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <SyncOrchestrator />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
