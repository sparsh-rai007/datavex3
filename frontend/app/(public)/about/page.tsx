import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Datavex AI | Tech Company in Mangalore, India',
  description: 'Learn about Datavex AI — our mission, team, and vision to empower businesses through artificial intelligence, data science, and digital transformation.',
  keywords: 'about Datavex AI, AI company Mangaluru, tech startup Mangalore, AI team India, Datavex AI Pvt Ltd, AI company Karnataka',
  alternates: {
    canonical: 'https://datavex.ai/company',
  },
  openGraph: {
    title: 'About Datavex AI | Tech Company in Mangalore, India',
    description: 'Learn about Datavex AI — our mission, team, and vision to empower businesses through artificial intelligence, data science, and digital transformation.',
    url: 'https://datavex.ai/company',
    type: 'website',
    images: ['https://datavex.ai/assets/og-company.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Datavex AI | Tech Company in Mangalore, India',
    description: 'Learn about Datavex AI — our mission, team, and vision to empower businesses through artificial intelligence, data science, and digital transformation.',
    images: ['https://datavex.ai/assets/og-company.jpg'],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
