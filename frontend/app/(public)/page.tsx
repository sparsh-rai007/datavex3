import HomeContent from './components/HomeContent';

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
