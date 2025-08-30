/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // Standard Next.js configuration for Netlify
  trailingSlash: true,
  
  experimental: {
    // Enable TurboPack for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Re-enable optimizeCss for critical CSS inlining
    optimizeCss: true,
    serverComponentsExternalPackages: ['canvas'],
    scrollRestoration: true,
    webpackBuildWorker: true,
  },
  
  compiler: {
    // Tree shaking for heroicons
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Modularize imports for better tree shaking
  modularizeImports: {
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
  
  // Optimized Image configuration for better Core Web Vitals
  images: {
    // Enable optimization - CRITICAL for LCP
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // Use Next.js built-in optimization instead of custom loader for better performance
    loader: 'default',
    // Remove custom loader for better optimization
    // loaderFile: './image-loader.js',
    // Optimized device sizes for mobile-first
    deviceSizes: [375, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Aggressive caching
    minimumCacheTTL: 31536000, // 1 year
    // Enable experimental features for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle analysis and optimization
  webpack: (config, { dev, isServer }) => {
    // SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    if (!dev && !isServer) {
      // Aggressive tree shaking for heavy libraries
      config.resolve.alias = {
        ...config.resolve.alias,
        '@gsap': 'gsap/dist/gsap.min.js',
        // Note: framer-motion alias removed due to export issues
      };
      
      // Optimize bundle splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // Critical libraries that change rarely
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 40,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 30,
            },
            // Supabase (often used)
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
            },
            // Utilities
            lib: {
              test: /[\\/]node_modules[\\/](date-fns|uuid|zustand)[\\/]/,
              name: 'lib',
              chunks: 'all',
              priority: 10,
            },
            // Default vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
            },
          },
        },
        // Minimize bundle size
        usedExports: true,
        sideEffects: false,
      };
      
      // Remove unused CSS and JS
      config.optimization.providedExports = true;
      config.optimization.usedExports = true;
    }
    
    return config;
  },
  
  // Headers for performance and caching
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
          // Enable Brotli compression hint
          {
            key: 'Accept-Encoding',
            value: 'br, gzip, deflate'
          }
        ]
      },
      // Aggressive caching for static assets
      {
        source: '/(_next/static|assets)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Font caching - Using valid Next.js route patterns
      {
        source: '/(.*)\\.woff',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.eot',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.ttf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.otf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Service worker
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

module.exports = withPWA(nextConfig); 