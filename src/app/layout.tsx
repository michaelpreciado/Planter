import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata = {
  title: 'Plant Tracker - Keep Your Plants Happy',
  description: 'A beautiful plant care app with a Tamagotchi-style companion to help you nurture your green friends.',
  keywords: 'plants, care, tracking, watering, garden, tamagotchi, plant tracker, garden app',
  authors: [{ name: 'Plant Tracker Team' }],
  creator: 'Plant Tracker Team',
  publisher: 'Plant Tracker',
  robots: 'index, follow',
  language: 'en',
  category: 'productivity',
  openGraph: {
    title: 'Plant Tracker - Keep Your Plants Happy',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    type: 'website',
    locale: 'en_US',
    url: 'https://your-app-url.netlify.app',
    siteName: 'Plant Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Plant Tracker App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plant Tracker - Keep Your Plants Happy',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    images: ['/twitter-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
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
        <link rel="preload" href="/assets/tamagatchi.png" as="image" type="image/png" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-dark-900 transition-colors duration-300`}>
        <Providers>
          <div className="min-h-screen flex flex-col pb-20">
            {children}
          </div>
          <BottomNavigation />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
} 