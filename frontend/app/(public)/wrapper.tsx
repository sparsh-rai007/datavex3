"use client";

import Navigation from "@/components/Navigation";
import Chatbot from "@/components/Chatbot";
import Analytics from "@/components/Analytics";
import { usePathname } from "next/navigation";

export default function PublicWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConsultation = pathname.startsWith("/consultation");

  return (
    <>
      {/* Sticky navbar */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <Navigation />
      </header>

      {/* Page content */}
      <main className="min-h-screen">
        {children}
      </main>

      {!isConsultation && <Chatbot />}
      <Analytics />
    </>
  );
}
