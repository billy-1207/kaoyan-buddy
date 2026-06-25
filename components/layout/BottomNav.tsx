"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/tasks", label: "任务", icon: "📋" },
  { href: "/pomodoro", label: "番茄", icon: "🍅" },
  { href: "/calendar", label: "打卡", icon: "📅" },
  { href: "/settings", label: "设置", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-mid flex justify-around items-center h-16 safe-area-bottom">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-0.5 text-xs py-1 px-2 rounded-lg transition-colors",
            pathname === item.href
              ? "text-primary font-semibold"
              : "text-muted"
          )}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
