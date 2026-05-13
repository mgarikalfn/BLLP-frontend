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
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useEffect(() => {
    hydrate();

    const storedToken = localStorage.getItem("accessToken");

    if (!accessToken && !storedToken) {
      router.push("/login");
    }
  }, [accessToken, hydrate]);

  return <AppShell>{children}</AppShell>;
}