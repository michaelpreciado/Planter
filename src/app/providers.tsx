'use client';

import { ThemeProvider } from '@/lib/theme-provider';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';
// PlantProvider removed - using direct store access now
import { AuthProvider } from '@/contexts/AuthContext';
import { PlantSyncWrapper } from '@/components/PlantSyncWrapper';
import { ImageSyncWrapper } from '@/components/ImageSyncWrapper';

// Dynamically import React Query to move heavy code into a separate chunk
const QueryProvider = dynamic(() => import('@tanstack/react-query').then(mod => {
  const QueryClient = mod.QueryClient;
  const QueryClientProvider = mod.QueryClientProvider;
  const queryClient = new QueryClient();
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <QueryProvider>
            <PlantSyncWrapper>
              <ImageSyncWrapper>
                {children}
              </ImageSyncWrapper>
            </PlantSyncWrapper>
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 