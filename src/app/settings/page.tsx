"use client";

import dynamic from "next/dynamic";

// Dynamically import ThemeToggle to avoid SSR issues with useTheme
const ThemeToggle = dynamic(
  () => import("@/components/theme/ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-foreground-secondary">
          Customise your AutoFlow experience
        </p>
      </header>

      {/* Theme section */}
      <section className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Theme</h2>
        <ThemeToggle />
      </section>

      {/* Account section placeholder */}
      <section className="card mb-6">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <p className="text-foreground-muted">
          Account settings coming in Phase 2 (Authentication)
        </p>
      </section>

      {/* Data section placeholder */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Data & Privacy</h2>
        <p className="text-foreground-muted">
          Export and privacy controls coming soon
        </p>
      </section>
    </div>
  );
}
