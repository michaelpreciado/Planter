import { AppShell } from './AppShell';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planter.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Planter',
  description: 'A beautiful plant care app with a Tamagotchi-style companion to help you nurture your green friends.',
  keywords: 'plants, care, tracking, watering, garden, tamagotchi, plant diary, garden app, simmy',
  authors: [{ name: 'Michael Preciado' }],
  creator: 'Michael Preciado',
  publisher: 'Planter',
  robots: 'index, follow',
  category: 'productivity',
  openGraph: {
    title: 'Planter',
    description: 'A beautiful plant care app with a Tamagotchi-style companion.',
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    siteName: 'Planter',
    images: [
      {
        url: '/apple-touch-icon.png',
        width: 180,
        height: 180,
        alt: 'Planter App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planter',
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

export const viewport: Viewport = {
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Planter" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300 min-h-dvh overflow-x-hidden">
        <div className="min-h-dvh bg-background">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
} 
