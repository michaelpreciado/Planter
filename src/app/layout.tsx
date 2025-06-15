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
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simmys Plant Diary App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simmys Plant Diary',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    images: ['/twitter-image.png'],
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
        <link rel="preload" href="/assets/happy.png" as="image" type="image/png" />
        <link rel="preload" href="/assets/thirsty.png" as="image" type="image/png" />
        <link rel="preload" href="/assets/mad.png" as="image" type="image/png" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-300 min-h-screen overflow-x-hidden mobile-scroll-container`}>
        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
          <BottomNavigation />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
} 