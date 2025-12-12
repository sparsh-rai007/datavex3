"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function ConsultationPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { layout: "month_view" });
    })();
  }, []);

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(to bottom, #ffffff, #1a1a1a)",
      }}
    >
      <h1 className="text-2xl font-semibold mb-4">Book a Consultation</h1>

      <Cal 
        calLink="darshan.suvarna/30min"
        style={{ width: "100%", minHeight: "600px" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
