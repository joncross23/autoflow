"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsTabs = [
  {
    href: "/dashboard/settings",
    label: "Account",
    icon: User,
    exact: true,
  },
  {
    href: "/dashboard/settings/appearance",
    label: "Appearance",
    icon: Palette,
    exact: false,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (tab: (typeof settingsTabs)[0]) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Manage your account and preferences
        </p>
      </header>

      {/* Tab navigation */}
      <nav className="mb-8">
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "shadow-sm"
                    : "hover:bg-[var(--bg-hover)]"
                )}
                style={{
                  backgroundColor: active ? "var(--bg-elevated)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-secondary)",
                }}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {children}
    </div>
  );
}
