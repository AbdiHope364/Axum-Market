import type { Metadata, Viewport } from 'next';
import './globals.css';
import GlobalErrorHandler from './GlobalErrorHandler';

export const metadata: Metadata = {
  title: 'AxumMarket — Administrative Governance Portal (Port 3001)',
  description: 'Dedicated administrative portal for seller approvals, listing moderation, and platform safety.',
  icons: {
    icon: [
      { url: '/admin-logo.png', type: 'image/png' },
      { url: '/logo-emblem.png', type: 'image/png' },
    ],
    shortcut: '/admin-logo.png',
    apple: '/admin-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#020617',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}
