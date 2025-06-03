/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify
  trailingSlash: true,
  
  experimental: {
    // Removed optimizeCss to fix critters module error
    serverComponentsExternalPackages: ['canvas'],
    scrollRestoration: true,
    webpackBuildWorker: true,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['supabase.co', 'your-supabase-domain.supabase.co'],
    deviceSizes: [360, 414, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    // SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    if (!dev && !isServer) {
      // Tree shaking for heavy libraries
      config.resolve.alias = {
        ...config.resolve.alias,
        '@gsap': 'gsap/dist/gsap.min.js',
      };
      
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|gsap|lottie-react)[\\/]/,
              name: 'animations',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 