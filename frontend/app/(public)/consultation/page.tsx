"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Link from "next/link";

export default function ConsultationPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { layout: "month_view" });
    })();
  }, []);

  return (
    <div
      className="min-h-screen p-6 pt-24" // ✅ pt-24 to clear navbar
      style={{
        background: "linear-gradient(to bottom, #ffffff, #1a1a1a)",
      }}
    >
      {/* 🔙 Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Page Title */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Book a Consultation
        </h1>
      </div>

      {/* Cal.com Embed */}
      <div className="max-w-6xl mx-auto">
        <Cal
          calLink="darshan.suvarna/30min"
          style={{ width: "100%", minHeight: "600px" }}
          config={{ layout: "month_view" }}
        />
      </div>
    </div>
  );
}
