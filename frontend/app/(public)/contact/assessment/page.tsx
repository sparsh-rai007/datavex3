import { Suspense } from 'react';
import AssessmentClient from './AssessmentPage';
import AssessmentPage from './AssessmentPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <AssessmentPage />
    </Suspense>
  );
}
