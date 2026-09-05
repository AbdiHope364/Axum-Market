import type { Metadata } from 'next';
import './globals.css';
import GlobalErrorHandler from './GlobalErrorHandler';

export const metadata: Metadata = {
  title: 'AxumMarket — Administrative Governance Portal (Port 3001)',
  description: 'Dedicated administrative portal for seller approvals, listing moderation, and platform safety.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}

