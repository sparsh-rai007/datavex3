import PublicWrapper from '../wrapper'; // ✅ added
import SolutionsClient from './SolutionsClient';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI & Data Solutions for Business | Datavex AI India',
  description: "Explore Datavex AI's custom AI agents, machine learning models, and automation solutions designed to transform your business operations and decision-making.",
  keywords: 'AI solutions India, custom AI agents, machine learning models, business automation, AI product development, data science services India',
  alternates: {
    canonical: 'https://datavex.ai/solutions',
  },
  openGraph: {
    title: 'AI & Data Solutions for Business | Datavex AI India',
    description: "Explore Datavex AI's custom AI agents, machine learning models, and automation solutions designed to transform your business operations and decision-making.",
    url: 'https://datavex.ai/solutions',
    type: 'website',
    images: ['https://datavex.ai/assets/og-solutions.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI & Data Solutions for Business | Datavex AI India',
    description: "Explore Datavex AI's custom AI agents, machine learning models, and automation solutions designed to transform your business operations and decision-making.",
    images: ['https://datavex.ai/assets/og-solutions.jpg'],
  },
};

export default function SolutionsPage() {
  return (
    <PublicWrapper>
      <SolutionsClient />
    </PublicWrapper> 
  );
}
