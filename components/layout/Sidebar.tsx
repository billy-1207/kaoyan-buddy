"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppConfig } from "@/lib/contexts/AppContext";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/tasks", label: "任务", icon: "📋" },
  { href: "/pomodoro", label: "番茄钟", icon: "🍅" },
  { href: "/calendar", label: "打卡", icon: "📅" },
  { href: "/toolkit", label: "工具箱", icon: "🧰" },
  { href: "/settings", label: "设置", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { config } = useAppConfig();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-mid min-h-screen flex-shrink-0">
      <div className="p-4 border-b border-mid">
        <h1 className="text-lg font-bold text-primary">🎓 考研搭子</h1>
        {config && (
          <p className="text-xs text-muted mt-1">
            {config.targetSchool} · {config.targetMajor}
          </p>
        )}
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-white font-medium"
                : "text-text hover:bg-light"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-mid">
        <Link
          href="/ai-buddy"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-light transition-colors"
        >
          🤖 AI 搭子
        </Link>
      </div>
    </aside>
  );
}
