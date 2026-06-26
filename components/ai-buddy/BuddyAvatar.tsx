"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BuddyAvatarProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function BuddyAvatar({ size = "default", className = "" }: BuddyAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    db.aiConfig.get("main").then((c) => {
      setAvatarUrl(c?.avatarUrl || null);
    });
  }, [key]);

  // Listen for avatar changes from settings page
  useEffect(() => {
    const handle = () => setKey((k) => k + 1);
    window.addEventListener("buddy-avatar-changed", handle);
    return () => window.removeEventListener("buddy-avatar-changed", handle);
  }, []);

  const fallbackClass =
    size === "sm" ? "text-xs" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Avatar size={size} className={className}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt="搭子头像" />
      ) : null}
      <AvatarFallback className={fallbackClass}>🤖</AvatarFallback>
    </Avatar>
  );
}
