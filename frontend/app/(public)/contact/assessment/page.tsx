import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

// Dynamically import the assessment form to prevent static generation
// Using ssr: false ensures it never runs on the server
const AssessmentForm = dynamicImport(() => import('./AssessmentForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading assessment...</p>
      </div>
    </div>
  ),
});

// Force dynamic rendering - prevent static generation
// These configs tell Next.js to never statically generate this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs'; // Use Node.js runtime

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    }>
      <AssessmentForm />
    </Suspense>
  );
}
