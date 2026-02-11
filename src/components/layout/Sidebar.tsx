"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Lightbulb,
  Kanban,
  Grid3X3,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks";
import packageJson from "../../../package.json";

// Hide features on production only (visible on local dev and staging)
const isProduction = process.env.NEXT_PUBLIC_APP_URL?.includes('autoflow23.vercel.app');

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/dashboard/tasks", label: "Tasks", icon: Kanban },
  { href: "/dashboard/matrix", label: "Matrix", icon: Grid3X3 },
  ...(!isProduction ? [{ href: "/dashboard/time-audit", label: "Time Audit", icon: Clock }] : []),
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile bottom nav with iOS safe area support
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-secondary safe-bottom safe-x tap-transparent">
        <div className="flex justify-around py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            // Exact match for /dashboard, prefix match for others
            const isActive = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors touch-target-sm no-select",
                  isActive
                    ? "text-primary"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-background-secondary transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-14 items-center border-b border-border",
        isCollapsed ? "justify-center px-2" : "justify-between px-3"
      )}>
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 transition-opacity"
            aria-label="Expand sidebar"
            title="Cmd/Ctrl + B"
          >
            <span className="text-[10px] text-white/80 font-normal">i</span>
            <span className="text-[11px] text-white font-bold -ml-0.5">T</span>
          </button>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-[10px] text-white/80 font-normal">i</span>
                <span className="text-[11px] text-white font-bold -ml-0.5">T</span>
              </div>
              <span className="text-sm font-semibold truncate">IdeaTracker</span>
            </Link>
            <button
              onClick={() => setIsCollapsed(true)}
              className="btn-ghost rounded-md p-1.5 shrink-0"
              aria-label="Collapse sidebar"
              title="Cmd/Ctrl + B"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            // Exact match for /dashboard, prefix match for others
            const isActive = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary-muted text-primary"
                      : "text-foreground-secondary hover:bg-background-tertiary hover:text-foreground"
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-foreground-muted">
            Version {packageJson.version}
          </p>
        </div>
      )}
    </aside>
  );
}
