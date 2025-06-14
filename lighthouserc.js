module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/list',
        'http://localhost:3000/add-plant',
        'http://localhost:3000/settings'
      ],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Performance metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        
        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 20000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 10000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        
        // Modern formats
        'modern-image-formats': 'error',
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'link-name': 'error',
        'button-name': 'error',
        
        // Best practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9090,
      storage: './lighthouse-ci-data'
    }
  }
}; 