import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planter',
  description: 'A local-first botanical journal with offline AI plant care notes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Planter',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#F5EFE0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
