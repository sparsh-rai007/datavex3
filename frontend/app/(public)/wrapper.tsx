"use client";

import Navigation from "@/components/Navigation";
import Chatbot from "@/components/Chatbot";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import { usePathname } from "next/navigation";

export default function PublicWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const disableChatbot = pathname.startsWith("/consultation");

  return (
    <>
      <Navigation />

      {/* 🔑 SINGLE SOURCE OF TRUTH FOR NAV OFFSET */}
      <main className="pt-16">


        {children}
      </main>

      {!disableChatbot && <Chatbot />}
      <CookieConsent />
      <Analytics />
    </>
  );
}
