import { Suspense } from 'react';
import Link from 'next/link';
import { ListPageClient } from './components/ListPageClient';
import { ListSkeleton } from './components/ListSkeleton';
import { FadeIn, SlideUp } from '@/components/AnimationReplacements';

// Metadata for better SEO and performance
export const metadata = {
  title: 'My Plants | Plant Tracker',
  description: 'View and manage your plant collection',
};

// Server Component - no JS shipped for static parts
export default function ListPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-16">
      {/* Static header - Server rendered */}
      <FadeIn className="bg-card/60 backdrop-blur-md px-6 py-4 border-b border-border relative z-20">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-foreground">My Plants</h1>
          <Link 
            href="/add-plant" 
            className="text-primary p-2 -m-2 rounded-lg active:bg-primary/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </Link>
        </div>
      </FadeIn>

      {/* Client component for dynamic content */}
      <SlideUp delay={0.1} className="flex-1">
        <Suspense fallback={<ListSkeleton />}>
          <ListPageClient />
        </Suspense>
      </SlideUp>
    </div>
  );
} 