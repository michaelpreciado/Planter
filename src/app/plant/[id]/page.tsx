import PlantDetailClient from './PlantDetailClient';

// Generate static params for dynamic route - required for static export
export async function generateStaticParams() {
  // For Capacitor apps, we'll generate a placeholder page that handles dynamic routing client-side
  // This allows static export to work while still supporting dynamic plant IDs
  return [{ id: 'placeholder' }];
}

interface PageProps {
  params: { id: string };
}

export default function PlantDetailPage({ params }: PageProps) {
  return <PlantDetailClient id={params.id} />;
}