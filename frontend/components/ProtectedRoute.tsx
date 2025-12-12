"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect if NOT logged in
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  // If user is logged in → allow page to render
  return <>{children}</>;
}
