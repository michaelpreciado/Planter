/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration for Netlify
  trailingSlash: true,
  
  experimental: {
    // Re-enable optimizeCss for critical CSS inlining
    optimizeCss: true,
    serverComponentsExternalPackages: ['canvas'],
    scrollRestoration: true,
    webpackBuildWorker: true,
    // Enable React server components
    appDir: true,
    // Optimize font loading
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } },
    ],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
  
  // Re-enable Image optimization for better performance
  images: {
    // Enable optimization for better Core Web Vitals
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // Netlify Image CDN compatibility
    loader: 'custom',
    loaderFile: './image-loader.js',
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
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
        // Replace framer-motion with lighter alternatives where possible
        'framer-motion$': 'framer-motion/dist/framer-motion.es.js',
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
            // Animation libraries (lazy loaded)
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|gsap|lottie-react)[\\/]/,
              name: 'animations',
              chunks: 'async',
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
      // Font caching
      {
        source: '/(.*\\.(woff|woff2|eot|ttf|otf))$',
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

module.exports = nextConfig; 