"use client";

import Navigation from "@/components/Navigation";
import Chatbot from "@/components/Chatbot";
import Analytics from "@/components/Analytics";
import { usePathname } from "next/navigation";

export default function PublicWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const disableChatbot =
    pathname.startsWith("/consultation");

  return (
    <>
      <Navigation />
      {children}
      {!disableChatbot && <Chatbot />}    {/* 👈 FIX HERE */}
      <Analytics />
    </>
  );
}
