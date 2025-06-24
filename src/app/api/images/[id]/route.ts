import { NextRequest, NextResponse } from 'next/server';
import { getSignedImageUrl } from '@/utils/imageStorage';

/**
 * GET /api/images/[id]
 *
 * `id` MUST be a URI-encoded storage path inside the `plant-images` bucket.
 * Returns `{ signedUrl: string }` with a 200 status code.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing image id' }, { status: 400 });
  }

  // The original storage path can contain slashes so it is expected to be URI-encoded on the client.
  const decodedPath = decodeURIComponent(id);

  try {
    const signedUrl = await getSignedImageUrl(decodedPath);
    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (error: any) {
    console.error('[image-url] Failed to sign URL', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to generate URL' }, { status: 500 });
  }
} 