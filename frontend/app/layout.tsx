import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './client-providers';
import datavexIcon from '@/app/public/datavexicon.png';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DATAVEX.ai - AI-Powered Lead Generation Platform',
  description: 'Transform your business with AI-powered lead generation...',
  icons: {
    icon: datavexIcon.src,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
         <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}