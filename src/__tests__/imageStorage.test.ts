/* eslint-disable @typescript-eslint/no-explicit-any */
import { uploadPlantImage } from '@/utils/imageStorage';

// Mock browser-image-compression to just return the original file
jest.mock('browser-image-compression', () => jest.fn((file) => Promise.resolve(file)));

// Mock Supabase client
jest.mock('@/utils/supabase', () => {
  const upload = jest.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null });
  const createSignedUrl = jest.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed.jpg' }, error: null });
  return {
    supabase: {
      storage: {
        from: () => ({ upload, createSignedUrl }),
      },
      from: () => ({ upsert: jest.fn().mockResolvedValue({}) }),
    },
  };
});

describe('uploadPlantImage', () => {
  it('should return path containing userId/plantId and signedUrl', async () => {
    // Mock createImageBitmap (not available in JSDOM)
    global.createImageBitmap = (async () =>
      ({ width: 100, height: 100, close: () => {} } as unknown as ImageBitmap)) as any;

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });

    const result = await uploadPlantImage(file, 'plant123', 'user456');

    expect(result.path).toContain('user456/plant123');
    expect(result.signedUrl.length).toBeGreaterThan(0);
  });
}); 