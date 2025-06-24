import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PageTransition } from '@/components/PageTransition';
import { ImageSyncDiagnostic } from '@/components/ImageSyncDiagnostic';
import { DebugPanel } from '@/components/DebugPanel';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const metadata = {
  metadataBase: new URL('https://simmys-plant-diary.netlify.app'),
  title: 'Simmys Plant Diary',
  description: 'A beautiful plant care app with a Tamagotchi-style companion to help you nurture your green friends.',
  keywords: 'plants, care, tracking, watering, garden, tamagotchi, plant diary, garden app, simmy',
  authors: [{ name: 'Simmy' }],
  creator: 'Simmy',
  publisher: 'Simmys Plant Diary',
  robots: 'index, follow',
  category: 'productivity',
  openGraph: {
    title: 'Simmys Plant Diary',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    type: 'website',
    locale: 'en_US',
    url: 'https://simmys-plant-diary.netlify.app',
    siteName: 'Simmys Plant Diary',
    images: [
      {
        url: '/apple-touch-icon.png',
        width: 180,
        height: 180,
        alt: 'Simmys Plant Diary App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simmys Plant Diary',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    images: ['/apple-touch-icon.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#5EB15E' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//your-supabase-domain.supabase.co" />
        <link rel="dns-prefetch" href="//netlify.app" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for initial render */
            body { 
              margin: 0; 
              font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background-color: rgb(249 250 251);
              color: rgb(17 24 39);
            }
            .dark body { 
              background-color: rgb(18 18 18);
              color: rgb(249 250 251);
            }
            /* Loading state */
            .initial-load { 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
            }
            .spinner { 
              width: 2rem; 
              height: 2rem; 
              border: 2px solid #5EB15E; 
              border-top: 2px solid transparent; 
              border-radius: 50%; 
              animation: spin 1s linear infinite; 
            }
            @keyframes spin { 
              to { transform: rotate(360deg); } 
            }
          `
        }} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-300 min-h-screen overflow-x-hidden mobile-scroll-container`}>
        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
          <BottomNavigation />
          <Toaster />
          <ImageSyncDiagnostic />
          <DebugPanel />
        </Providers>
      </body>
    </html>
  );
} 