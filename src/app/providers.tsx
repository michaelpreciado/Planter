'use client';

import { ThemeProvider } from '@/lib/theme-provider';
// PlantProvider removed - using direct store access now
import { AuthProvider } from '@/contexts/AuthContext';
import { PlantSyncWrapper } from '@/components/PlantSyncWrapper';
import { ImageSyncWrapper } from '@/components/ImageSyncWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <PlantSyncWrapper>
          <ImageSyncWrapper>
            {children}
          </ImageSyncWrapper>
        </PlantSyncWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
} 