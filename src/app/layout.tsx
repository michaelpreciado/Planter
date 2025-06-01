import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Version component for top left display
function VersionDisplay() {
  return (
    <div className="fixed top-4 left-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        v.1.0
      </span>
    </div>
  );
}

export const metadata = {
  title: 'Plant Tracker - Keep Your Plants Happy',
  description: 'A beautiful plant care app with a Tamagotchi-style companion to help you nurture your green friends.',
  keywords: 'plants, care, tracking, watering, garden, tamagotchi',
  authors: [{ name: 'Plant Tracker Team' }],
  openGraph: {
    title: 'Plant Tracker - Keep Your Plants Happy',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plant Tracker - Keep Your Plants Happy',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-dark-900 transition-colors duration-300`}>
        <Providers>
          <VersionDisplay />
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