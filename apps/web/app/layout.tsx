import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'AxumMarket | Ethiopian Livestock Classifieds & Direct Marketplace',
  description:
    'Connect directly with livestock sellers across Ethiopia. Browse dairy cows, bulls, calves, sheep, and goats with 3-angle photos and call sellers directly.',
  keywords: [
    'Ethiopia livestock',
    'dairy cow Ethiopia',
    'Borana bull',
    'Sululta cows',
    'sheep Dorper',
    'livestock marketplace Ethiopia',
    'cattle classifieds',
  ],
  icons: {
    icon: [
      { url: '/logo-emblem.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo-emblem.png',
    apple: '/logo-emblem.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-green-100 selection:text-green-900 overflow-x-hidden max-w-full">
        <LanguageProvider>
          <GlobalErrorHandler />
          <Navbar />
          <main className="flex-1 w-full max-w-full overflow-x-hidden pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
