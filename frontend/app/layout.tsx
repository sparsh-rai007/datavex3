import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './client-providers';
import Script from 'next/script';
import datavexIcon from '@/app/public/datavexicon.png';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DATAVEX.ai - AI-Powered Lead Generation Platform',
  description: 'Transform your business with AI-powered lead generation...',
  icons: {
    icon: datavexIcon.src,
  },
  other: {
    'google-site-verification': '8KaFVPaprXt8CTM_kXBb8SC_U-92w2zmGyOgPGhbqmQ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en">
      <body className={inter.className}>
        {gtmId && (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
            <Script
              id="gtm"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
              }}
            />
          </>
        )}

        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}