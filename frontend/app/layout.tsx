import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './client-providers';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DATAVEX.ai - AI-Powered Lead Generation Platform',
  description: 'Transform your business with AI-powered lead generation...'
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