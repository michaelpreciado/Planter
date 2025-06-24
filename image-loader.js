// Custom image loader for Netlify deployment with optimization
export default function myImageLoader({ src, width, quality }) {
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return src;
  }
  
  // For production on Netlify, use built-in optimization
  const params = new URLSearchParams();
  
  if (width) {
    params.set('w', width.toString());
  }
  
  if (quality) {
    params.set('q', quality.toString());
  }
  
  // Use Netlify's built-in image transformation
  // This works with their CDN for optimized delivery
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${baseUrl}${src}?${params.toString()}`;
} 