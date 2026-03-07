"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/store/authStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!token && !storedToken) {
      router.push("/login");
    }
  }, [token]);

  return <AppShell>{children}</AppShell>;
}