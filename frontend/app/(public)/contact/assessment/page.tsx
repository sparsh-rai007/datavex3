export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AssessmentPage from "./AssessmentPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentPage />
    </Suspense>
  );
}
