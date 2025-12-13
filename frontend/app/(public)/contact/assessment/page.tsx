import ClientOnlyAssessment from './ClientOnlyAssessment';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Page() {
  return <ClientOnlyAssessment />;
}
