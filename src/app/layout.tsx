import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/main.scss';
import AppProviders from '@/shared/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Seremeety',
  description: 'Seremeety - 만남의 세레나데',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
  appleWebApp: {
    title: 'Seremeety',
  },
  openGraph: {
    title: 'Seremeety',
    description: 'Seremeety - 만남의 세레나데',
    images: ['/logo512.png'],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
