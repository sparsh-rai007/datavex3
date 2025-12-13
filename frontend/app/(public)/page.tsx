import HomeContent from './components/HomeContent';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return <HomeContent />;
}
