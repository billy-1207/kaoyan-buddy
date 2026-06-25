"use client";
import { type ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { seedIfEmpty, ensureTodayCheckIn } from "@/lib/seed";

export function MainLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedIfEmpty().then(() => ensureTodayCheckIn());
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:pl-0 pb-20 lg:pb-0 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
