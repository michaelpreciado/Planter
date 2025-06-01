# Plant Tracker Web - Installation Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Git

## Installation Steps

### 1. Install Dependencies

```bash
# Install all required packages
npm install

# If you encounter any peer dependency warnings, run:
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### 3. Development Setup

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 4. Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Key Dependencies

The following major packages are required:

### Core Framework
- `next@^14.0.4` - Next.js framework
- `react@^18.2.0` - React library
- `typescript@^5.3.3` - TypeScript support

### Animation & UI
- `framer-motion@^10.16.16` - Animation library
- `gsap@^3.12.2` - Advanced animations
- `lottie-react@^2.4.0` - Lottie animations

### UI Components
- `@radix-ui/react-*` - Accessible UI primitives
- `tailwindcss@^3.3.6` - Utility-first CSS

### State Management
- `zustand@^4.4.7` - State management

### Utilities
- `date-fns@^3.0.6` - Date manipulation
- `uuid@^9.0.1` - Unique ID generation

## Missing Dependencies Installation

If you see import errors, install the missing packages:

```bash
# Essential Next.js packages
npm install next@^14.0.4 react@^18.2.0 react-dom@^18.2.0

# Animation packages
npm install framer-motion@^10.16.16 gsap@^3.12.2 lottie-react@^2.4.0

# UI packages
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-toast @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-dropdown-menu

# State management
npm install zustand@^4.4.7

# Utilities
npm install date-fns@^3.0.6 uuid@^9.0.1 clsx@^2.0.0 tailwind-merge@^2.2.0

# Supabase
npm install @supabase/supabase-js@^2.38.5

# Dev dependencies
npm install --save-dev @types/node@^20.10.5 @types/react@^18.2.45 @types/react-dom@^18.2.18 @types/uuid@^9.0.7
```

## TypeScript Configuration

The project uses strict TypeScript. Key configurations:

- Path mapping enabled (`@/*` → `./src/*`)
- Strict mode enabled
- Modern ES2017 target
- Bundle-aware module resolution

## Performance Features

### Bundle Optimization
- Dynamic imports for heavy libraries
- Tree shaking enabled
- Webpack bundle analysis available via `npm run analyze`

### Image Optimization
- Next.js Image component with AVIF/WebP support
- Responsive image sizes for different breakpoints

### Caching & Headers
- Optimal caching headers configured
- DNS prefetch for external resources

## Development Tools

### Linting & Formatting
```bash
npm run lint        # ESLint checks
npm run type-check  # TypeScript checks
```

### Performance Testing
```bash
npm run lighthouse  # Run Lighthouse audit
```

### Storybook (Optional)
```bash
npm run storybook   # Component documentation
```

## Deployment

### Vercel (Recommended)
1. Connect your Git repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Run `npm install` for missing dependencies
2. **TypeScript errors**: Check path mappings in `tsconfig.json`
3. **Build failures**: Ensure all environment variables are set
4. **Hydration errors**: Check for server/client rendering mismatches

### Performance Issues
- Use `npm run analyze` to identify large bundles
- Check Lighthouse scores with `npm run lighthouse`
- Monitor Core Web Vitals in production

## Migration Notes

This application was converted from React Native to Next.js web:

### Changed Components
- `react-native-svg` → native SVG elements
- `react-navigation` → Next.js routing
- `moti` animations → Framer Motion
- Native components → HTML elements

### Preserved Features
- Plant state management (enhanced with Zustand)
- Tamagotchi animations (improved with GSAP)
- Theme system (enhanced with system detection)
- Component structure (modernized) 