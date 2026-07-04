import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planter — Plant Care Journal for iPhone',
  description:
    'A private plant journal with marigold roots: photo growth timelines, care reminders, and on-device AI plant help. No accounts, no cloud, no tracking.',
  manifest: '/manifest.json',
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

export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <>{children}</>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
