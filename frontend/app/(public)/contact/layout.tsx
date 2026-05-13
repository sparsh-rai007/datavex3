import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Datavex AI | AI Company Mangalore, India',
  description: 'Get in touch with Datavex AI for AI consulting, data science services, or partnership inquiries. We are based in Mangaluru, Karnataka, India.',
  keywords: 'contact Datavex AI, AI company contact Mangalore, AI consulting India, hire AI company India, data science company contact Karnataka',
  alternates: {
    canonical: 'https://datavex.ai/contact',
  },
  openGraph: {
    title: 'Contact Datavex AI | AI Company Mangalore, India',
    description: 'Get in touch with Datavex AI for AI consulting, data science services, or partnership inquiries. We are based in Mangaluru, Karnataka, India.',
    url: 'https://datavex.ai/contact',
    type: 'website',
    images: ['https://datavex.ai/assets/og-contact.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Datavex AI | AI Company Mangalore, India',
    description: 'Get in touch with Datavex AI for AI consulting, data science services, or partnership inquiries. We are based in Mangaluru, Karnataka, India.',
    images: ['https://datavex.ai/assets/og-contact.jpg'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
