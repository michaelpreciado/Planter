'use client';

import { usePathname } from 'next/navigation';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PageTransition } from '@/components/PageTransition';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrototype = pathname?.startsWith('/prototype');

  return (
    <Providers>
      <main className={`relative min-h-dvh bg-background ${isPrototype ? '' : 'pb-nav-safe'}`}>
        {isPrototype ? children : <PageTransition>{children}</PageTransition>}
      </main>
      {!isPrototype && <BottomNavigation />}
      <Toaster />
    </Providers>
  );
}
