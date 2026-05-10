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
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");

    if (!accessToken && !storedToken) {
      router.push("/login");
    }
  }, [accessToken]);

  return <AppShell>{children}</AppShell>;
}