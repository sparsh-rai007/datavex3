"use client";

import Navigation from "@/components/Navigation";
import Chatbot from "@/components/Chatbot";
import Analytics from "@/components/Analytics";
import { usePathname } from "next/navigation";

export default function PublicWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isConsultation = pathname.startsWith("/consultation");
  const disableChatbot = isConsultation;

  return (
    <>
      {/* Navbar always visible */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <Navigation />
      </header>

      {/* Main content */}
      <main
        className={`min-h-screen ${
          isConsultation ? "pt-16" : "pt-20"
        }`}
      >
        {children}
      </main>

      {/* Chatbot disabled only for consultation */}
      {!disableChatbot && <Chatbot />}

      <Analytics />
    </>
  );
}
