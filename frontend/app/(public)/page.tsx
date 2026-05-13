import HomeContent from './components/HomeContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datavex AI | AI & Data Science Company in Mangalore',
  description: 'Datavex AI is a technology company in Mangaluru specializing in AI, data science, cloud infrastructure, and digital transformation solutions for businesses across India.',
  keywords: 'AI company Mangalore, data science India, digital transformation, machine learning, cloud infrastructure, AI solutions Karnataka',
  alternates: {
    canonical: 'https://datavex.ai/',
  },
  openGraph: {
    title: 'Datavex AI | AI & Data Science Company in Mangalore',
    description: 'Datavex AI is a technology company in Mangaluru specializing in AI, data science, cloud infrastructure, and digital transformation solutions for businesses across India.',
    url: 'https://datavex.ai/',
    type: 'website',
    images: ['https://datavex.ai/assets/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Datavex AI | AI & Data Science Company in Mangalore',
    description: 'Datavex AI is a technology company in Mangaluru specializing in AI, data science, cloud infrastructure, and digital transformation solutions for businesses across India.',
    images: ['https://datavex.ai/assets/og-image.jpg'],
  },
};

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs'; // Use Node.js runtime

export default function Home() {
  // Throw during build to prevent static generation if needed
  // This ensures the page is never statically generated
  return <HomeContent />;
}
