"use client";
import Link from "next/link";
import { BuddyAvatar } from "./BuddyAvatar";

export function FloatingBuddy() {
  return (
    <Link
      href="/ai-buddy"
      className="fixed bottom-20 lg:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-light hover:scale-110 transition-all animate-bounce-slow"
      title="和搭子聊天"
    >
      <BuddyAvatar size="lg" />
    </Link>
  );
}
