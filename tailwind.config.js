/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  // Performance optimization: reduce bundle size
  corePlugins: {
    // Disable unused features
    preflight: true,
    container: false,
    accessibility: true,
    // Keep only essential plugins
    animation: true,
    backdropBlur: true,
    backgroundImage: true, // Need gradients for skeleton loading
    gradientColorStops: true,
    ringWidth: true,
    ringColor: true,
    divideWidth: false,
    divideColor: false,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textUnderlineOffset: false,
  },
  theme: {
    // Optimize color palette - remove unused colors
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      primary: {
        DEFAULT: '#5EB15E',
        50: '#E8F5E8',
        100: '#D1EBD1',
        500: '#4A8F4A',
        600: '#3A6F3A',
        900: '#0A1F0A',
      },
      dark: {
        DEFAULT: '#121212',
        800: '#3B3B3B',
        900: '#121212',
      },
      // Use CSS custom properties for dynamic colors
      background: 'rgb(var(--background) / <alpha-value>)',
      foreground: 'rgb(var(--foreground) / <alpha-value>)',
      card: 'rgb(var(--card) / <alpha-value>)',
      'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
      muted: 'rgb(var(--muted) / <alpha-value>)',
      'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
      destructive: 'rgb(var(--destructive) / <alpha-value>)',
      border: 'rgb(var(--border) / <alpha-value>)',
      ring: 'rgb(var(--ring) / <alpha-value>)',
      secondary: 'rgb(var(--secondary) / <alpha-value>)',
      'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
      'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
      accent: 'rgb(var(--accent) / <alpha-value>)',
      'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
      // Keep essential grays
      gray: {
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      // Essential colors only
      red: {
        500: '#ef4444',
        600: '#dc2626',
      },
      blue: {
        300: '#93c5fd',
        500: '#3b82f6',
      },
      green: {
        500: '#10b981',
        600: '#059669',
      },
      yellow: {
        400: '#fbbf24',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Reduce animation count - keep only essential ones
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Reduce spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Essential screen sizes only
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      // Minimal shadow palette
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
    },
  },
  // Essential plugins only
  plugins: [
    // Remove @tailwindcss/typography if not used
    // require('@tailwindcss/typography'),
  ],
  // Aggressive purging for production
  safelist: [
    // Only safelist absolutely necessary classes
    'bg-primary',
    'text-primary',
    'border-primary',
    'animate-spin',
    'animate-pulse-slow',
  ],
}; 