import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PageTransition } from '@/components/PageTransition';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#10B981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plant Diary" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-300 min-h-dvh overflow-x-hidden mobile-scroll-container flex flex-col`}>
        <Providers>
          <main 
            className="flex-grow"
            style={{
              minHeight: "calc(100dvh - var(--nav-height) - env(safe-area-inset-bottom, 0px))",
              paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <BottomNavigation />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
} 