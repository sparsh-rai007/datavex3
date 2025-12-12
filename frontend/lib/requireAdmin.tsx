'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to finish checking

    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
    }
  }, [loading, isAuthenticated, user, router]);

  // While loading → avoid flash of content
  if (loading || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
