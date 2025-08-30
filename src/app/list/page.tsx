import { Suspense } from 'react';
import { ListPageClient } from './components/ListPageClient';
import { ListSkeleton } from './components/ListSkeleton';
import { SlideUp } from '@/components/AnimationReplacements';

// Metadata for better SEO and performance
export const metadata = {
  title: 'My Plants | Plant Tracker',
  description: 'View and manage your plant collection',
};

// Server Component - no JS shipped for static parts
export default function ListPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-16">
      {/* Client component for dynamic content */}
      <SlideUp delay={0.1} className="flex-1">
        <Suspense fallback={<ListSkeleton />}>
          <ListPageClient />
        </Suspense>
      </SlideUp>
    </div>
  );
} 