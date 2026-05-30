import ProductsClient from './ProductsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Products Suite | Datavex AI India',
  description: 'Discover Datavex AI\'s premium suite of intelligent SaaS and MLOps platforms: LeadVex for outreach, ContentVex for autonomous CMS, ChatVex for CRM support, and the DataVex Engine.',
  keywords: 'AI products, LeadVex, ContentVex, ChatVex, MLOps engine, data pipelines, automated CMS, AI outreach India, Mangalore tech company',
  alternates: {
    canonical: 'https://datavex.ai/products',
  },
  openGraph: {
    title: 'AI Products Suite | Datavex AI India',
    description: 'Discover Datavex AI\'s premium suite of intelligent SaaS and MLOps platforms.',
    url: 'https://datavex.ai/products',
    type: 'website',
    images: ['https://datavex.ai/assets/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Products Suite | Datavex AI India',
    description: 'Discover Datavex AI\'s premium suite of intelligent SaaS and MLOps platforms.',
    images: ['https://datavex.ai/assets/og-image.jpg'],
  },
};

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default function ProductsPage() {
  return <ProductsClient />;
}
