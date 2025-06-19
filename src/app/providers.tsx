'use client';

import { ThemeProvider } from '@/lib/theme-provider';
// PlantProvider removed - using direct store access now
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
        <PlantSyncWrapper>
          {children}
        </PlantSyncWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
} 