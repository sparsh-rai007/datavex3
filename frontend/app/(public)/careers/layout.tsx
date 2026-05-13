import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at Datavex AI | AI Jobs in Mangalore India',
  description: 'Join Datavex AI and work on cutting-edge AI, data science, and cloud projects. View open roles in Mangaluru, Karnataka and remote positions across India.',
  keywords: 'AI jobs Mangalore, data science jobs India, careers Datavex AI, AI engineer jobs Karnataka, tech jobs Mangaluru, machine learning jobs India',
  alternates: {
    canonical: 'https://datavex.ai/careers',
  },
  openGraph: {
    title: 'Careers at Datavex AI | AI Jobs in Mangalore India',
    description: 'Join Datavex AI and work on cutting-edge AI, data science, and cloud projects. View open roles in Mangaluru, Karnataka and remote positions across India.',
    url: 'https://datavex.ai/careers',
    type: 'website',
    images: ['https://datavex.ai/assets/og-careers.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Datavex AI | AI Jobs in Mangalore India',
    description: 'Join Datavex AI and work on cutting-edge AI, data science, and cloud projects. View open roles in Mangaluru, Karnataka and remote positions across India.',
    images: ['https://datavex.ai/assets/og-careers.jpg'],
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
