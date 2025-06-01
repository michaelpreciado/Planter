'use client';

import { ThemeProvider } from '@/lib/theme-provider';
import { PlantProvider } from '@/lib/plant-store';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlantSyncWrapper } from '@/components/PlantSyncWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <PlantProvider>
          <PlantSyncWrapper>
            {children}
          </PlantSyncWrapper>
        </PlantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 