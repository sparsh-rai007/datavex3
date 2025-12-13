import { Suspense } from 'react';
import dynamicImport from 'next/dynamic'; // ✅ RENAMED

const AssessmentForm = dynamicImport(() => import('./AssessmentForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading assessment…</p>
    </div>
  ),
});

// ✅ These are Next.js route configs — KEEP THEM
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AssessmentForm />
    </Suspense>
  );
}
