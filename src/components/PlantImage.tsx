import Image from 'next/image';
import useSWR from 'swr';
import clsx from 'clsx';
import { getSignedImageUrl } from '@/utils/imageStorage';

const imageUrlFetcher = async (storagePath: string) => {
  const signedUrl = await getSignedImageUrl(storagePath);
  return { signedUrl };
};

interface PlantImageProps {
  /** Storage path inside `plant-images` bucket e.g. userId/plantId/uuid.jpg */
  storagePath: string | null;
  alt?: string;
  className?: string;
}

/**
 * Displays a Supabase‐backed plant image that automatically refreshes its signed URL.
 */
export default function PlantImage({ storagePath, alt = 'Plant photo', className }: PlantImageProps) {
  const { data, error, isLoading } = useSWR(
    storagePath ? `image-${storagePath}` : null,
    () => storagePath ? imageUrlFetcher(storagePath) : null,
    {
      // Signed URLs expire every 24h, refresh after ~23h
      refreshInterval: 1000 * 60 * 60 * 23,
    }
  );

  if (!storagePath) {
    return (
      <div
        className={clsx('bg-gray-200 flex items-center justify-center', className)}
        role="img"
        aria-label="No image"
      >
        🌱
      </div>
    );
  }

  if (isLoading) {
    return <div className={clsx('animate-pulse bg-gray-200', className)} />;
  }

  if (error || !data?.signedUrl) {
    return (
      <div
        className={clsx('bg-gray-200 flex items-center justify-center', className)}
        role="img"
        aria-label="Image unavailable"
      >
        ❌
      </div>
    );
  }

  return (
    <Image
      src={data.signedUrl}
      alt={alt}
      fill
      sizes="(max-width:768px) 80vw, 30vw"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAF/wL+WhtSGQAAAABJRU5ErkJggg=="
      className={className}
    />
  );
} 