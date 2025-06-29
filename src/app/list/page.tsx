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
      <FadeIn className="bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl px-6 py-4 border-b border-white/20 dark:border-white/10 relative z-20">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-foreground p-2 -m-2 rounded-lg active:bg-accent transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="w-6 h-6"></div>
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