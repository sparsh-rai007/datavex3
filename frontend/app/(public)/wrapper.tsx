"use client";

import Navigation from "@/components/Navigation";
import Chatbot from "@/components/Chatbot";
import Analytics from "@/components/Analytics";
import { usePathname } from "next/navigation";

export default function PublicWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const disableChatbot = pathname.startsWith("/consultation");

  return (
    <>
      {/* ✅ Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <Navigation />
      </header>

      {/* ✅ Page Content (prevents overlap with navbar) */}
      <main className="pt-20 min-h-screen">
        {children}
      </main>

      {/* ✅ Chatbot logic untouched */}
      {!disableChatbot && <Chatbot />}

      <Analytics />
    </>
  );
}
